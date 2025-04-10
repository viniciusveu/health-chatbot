import { Test, TestingModule } from '@nestjs/testing';
import { MessageWorkerController } from './message-worker.controller';
import { MessageWorkerService } from './message-worker.service';
import { MessageDataDto, ReceivedMessageDto } from '@app/shared/dtos';
import { InternalContextOptions } from '@app/shared/enums'; // Although not directly used in assertions, good to have for context

// Create a mock implementation for the MessageWorkerService
const mockMessageWorkerService = {
  sendMessage: jest.fn(),
  receiveMessage: jest.fn(),
};

describe('MessageWorkerController', () => {
  let controller: MessageWorkerController;
  let service: MessageWorkerService; // Variable to hold the mocked service instance

  beforeEach(async () => {
    // Reset mocks before each test to ensure isolation
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageWorkerController],
      providers: [
        // Provide the mock service instead of the real one
        {
          provide: MessageWorkerService,
          useValue: mockMessageWorkerService,
        },
      ],
    }).compile();

    controller = module.get<MessageWorkerController>(MessageWorkerController);
    // Get the instance of the mocked service for verification if needed,
    // though direct interaction is usually via the mock object itself.
    service = module.get<MessageWorkerService>(MessageWorkerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ==========================================================================
  // Tests for sendMessage (EventPattern)
  // ==========================================================================
  describe('sendMessage (EventPattern)', () => {
    it('should call messageWorkerService.sendMessage with the received data', async () => {
      // Arrange
      const testData: MessageDataDto = {
        contact: '+1112223333',
        message: 'Test message via event',
        eventId: 456,
      };

      // Act: Call the controller method simulating an event trigger
      await controller.sendMessage(testData);

      // Assert: Verify the service method was called correctly
      expect(mockMessageWorkerService.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockMessageWorkerService.sendMessage).toHaveBeenCalledWith(
        testData,
      );
    });

    it('should handle potential errors from service.sendMessage gracefully (controller returns void)', async () => {
      // Arrange
      const testData: MessageDataDto = {
        contact: '+1112224444',
        message: 'Test message causing error',
        eventId: 457,
      };
      const serviceError = new Error('Service failed to send');
      // Make the mocked service method throw an error
      mockMessageWorkerService.sendMessage.mockRejectedValueOnce(serviceError);

      // Act & Assert: Expect the controller method to propagate the error
      // Since the controller method itself doesn't have a try/catch,
      // the error thrown by the service will bubble up.
      await expect(controller.sendMessage(testData)).rejects.toThrow(
        serviceError,
      );

      // Verify the service method was still called
      expect(mockMessageWorkerService.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockMessageWorkerService.sendMessage).toHaveBeenCalledWith(
        testData,
      );
    });
  });

  // ==========================================================================
  // Tests for receiveMessage (POST /webhook)
  // ==========================================================================
  describe('receiveMessage (POST /webhook)', () => {
    it('should call messageWorkerService.receiveMessage with From and Body from the DTO', async () => {
      // Arrange
      const testBody: ReceivedMessageDto = {
        From: 'whatsapp:+9998887777',
        Body: 'Hello from webhook',
        // Add other potential fields from ReceivedMessageDto if they exist,
        // even if not used by this specific controller method, for completeness.
        eventId: 458,
      };

      // Act: Call the controller method simulating a POST request
      await controller.receiveMessage(testBody);

      // Assert: Verify the service method was called with extracted data
      expect(mockMessageWorkerService.receiveMessage).toHaveBeenCalledTimes(1);
      expect(mockMessageWorkerService.receiveMessage).toHaveBeenCalledWith(
        testBody.From,
        testBody.Body,
      );
    });

    it('should handle potential errors from service.receiveMessage gracefully (controller returns void)', async () => {
      // Arrange
      const testBody: ReceivedMessageDto = {
        From: 'whatsapp:+9998886666',
        Body: 'Webhook message causing error',
        eventId: 458,
      };
      const serviceError = new Error('Service failed to receive');
      // Make the mocked service method throw an error
      mockMessageWorkerService.receiveMessage.mockRejectedValueOnce(
        serviceError,
      );

      // Act & Assert: Expect the controller method to propagate the error
      await expect(controller.receiveMessage(testBody)).rejects.toThrow(
        serviceError,
      );

      // Verify the service method was still called
      expect(mockMessageWorkerService.receiveMessage).toHaveBeenCalledTimes(1);
      expect(mockMessageWorkerService.receiveMessage).toHaveBeenCalledWith(
        testBody.From,
        testBody.Body,
      );
    });
  });
});
