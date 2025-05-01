import { Test, TestingModule } from '@nestjs/testing';
import { MessageWorkerService } from './message-worker.service';
import { LoggingService } from '@app/logging';
import { QueueClient } from '@app/queue';
import { TwilioService } from './twilio.service';
import { MessageDataDto } from '@app/shared/dtos';
import { InternalContextOptions } from '@app/shared/enums';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Mock implementations for dependencies
const mockLoggingService = {
  messageSent: jest.fn(),
  messageReceived: jest.fn(),
};

const mockQueueClient = {
  emit: jest.fn(),
};

const mockTwilioService = {
  sendWhatsappMessage: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

// Mock Logger methods if needed (e.g., for the warning in receiveMessage)
jest.spyOn(Logger, 'log').mockImplementation(() => {});
jest.spyOn(Logger, 'warn').mockImplementation(() => {});
jest.spyOn(Logger, 'error').mockImplementation(() => {});
// Mock console.log/error if needed (used in sendMessage)
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('MessageWorkerService', () => {
  let service: MessageWorkerService;
  let loggingService: LoggingService;
  let queueClient: QueueClient;
  let twilioService: TwilioService;
  let configService: ConfigService;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageWorkerService,
        { provide: LoggingService, useValue: mockLoggingService },
        { provide: QueueClient, useValue: mockQueueClient },
        { provide: TwilioService, useValue: mockTwilioService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MessageWorkerService>(MessageWorkerService);
    loggingService = module.get<LoggingService>(LoggingService);
    queueClient = module.get<QueueClient>(QueueClient);
    twilioService = module.get<TwilioService>(TwilioService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================================
  // Tests for sendMessage
  // ==========================================================================
  describe('sendMessage', () => {
    const testData: MessageDataDto = {
      contact: '+15551234567',
      message: 'Hello there!',
      eventId: 123,
    };
    const mockSid = 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

    it('should call TwilioService.sendWhatsappMessage and LoggingService.messageSent on success', async () => {
      // Arrange
      mockTwilioService.sendWhatsappMessage.mockResolvedValueOnce(mockSid);
      mockLoggingService.messageSent.mockResolvedValueOnce(undefined); // Simulates successful logging
      mockConfigService.get.mockReturnValueOnce('dev');

      // Act
      await service.sendMessage(testData);

      // Assert
      expect(mockTwilioService.sendWhatsappMessage).toHaveBeenCalledTimes(1);
      expect(mockTwilioService.sendWhatsappMessage).toHaveBeenCalledWith(
        testData.contact,
        testData.message,
      );
      expect(mockLoggingService.messageSent).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.messageSent).toHaveBeenCalledWith({
        id: testData.eventId,
        sid: mockSid,
      });
      expect(console.error).not.toHaveBeenCalled(); // Ensure no error was logged
    });

    it('should call LoggingService.messageSent with error if TwilioService fails', async () => {
      // Arrange
      const twilioError = new Error('Twilio API Error');
      mockTwilioService.sendWhatsappMessage.mockRejectedValueOnce(twilioError);
      mockLoggingService.messageSent.mockResolvedValueOnce(undefined); // Logging the error succeeds

      // Act
      await service.sendMessage(testData);

      // Assert
      expect(mockTwilioService.sendWhatsappMessage).toHaveBeenCalledTimes(1);
      expect(mockTwilioService.sendWhatsappMessage).toHaveBeenCalledWith(
        testData.contact,
        testData.message,
      );
      expect(mockLoggingService.messageSent).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.messageSent).toHaveBeenCalledWith({
        id: testData.eventId,
        msgError: `${twilioError}`, // Error is stringified
      });
      expect(console.error).toHaveBeenCalledWith(
        'Erro ao enviar mensagem:',
        twilioError,
      );
    });

    it('should call LoggingService.messageSent with error if LoggingService fails after successful send', async () => {
      // Arrange
      const loggingError = new Error('Logging DB Error');
      mockTwilioService.sendWhatsappMessage.mockResolvedValueOnce(mockSid);
      // First call (success log) fails, second call (error log) succeeds
      mockLoggingService.messageSent
        .mockRejectedValueOnce(loggingError)
        .mockResolvedValueOnce(undefined);

      // Act
      await service.sendMessage(testData);

      // Assert
      expect(mockTwilioService.sendWhatsappMessage).toHaveBeenCalledTimes(1);
      expect(mockTwilioService.sendWhatsappMessage).toHaveBeenCalledWith(
        testData.contact,
        testData.message,
      );
      // LoggingService.messageSent is called twice: once in try, once in catch
      expect(mockLoggingService.messageSent).toHaveBeenCalledTimes(2);
      // First call (attempted success log)
      expect(mockLoggingService.messageSent).toHaveBeenNthCalledWith(1, {
        id: testData.eventId,
        sid: mockSid,
      });
      // Second call (logging the error from the first call)
      expect(mockLoggingService.messageSent).toHaveBeenNthCalledWith(2, {
        id: testData.eventId,
        msgError: `${loggingError}`,
      });
      expect(console.error).toHaveBeenCalledWith(
        'Erro ao enviar mensagem:',
        loggingError,
      );
    });
  });

  // ==========================================================================
  // Tests for receiveMessage
  // ==========================================================================
  describe('receiveMessage', () => {
    const testFrom = 'whatsapp:+15559876543';
    const testBody = 'Incoming message';
    const mockEventId = 456;

    it('should log receipt, get eventId, and emit to queue on success', async () => {
      // Arrange
      mockLoggingService.messageReceived.mockResolvedValueOnce(mockEventId);

      // Act
      await service.receiveMessage(testFrom, testBody);

      // Assert
      expect(Logger.log).toHaveBeenCalledWith(
        `Received incoming message from Twilio: From: ${testFrom} | Message: ${testBody}`,
      );
      expect(mockLoggingService.messageReceived).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.messageReceived).toHaveBeenCalledWith({
        from: testFrom,
        body: testBody,
      });
      expect(mockQueueClient.emit).toHaveBeenCalledTimes(1);
      expect(mockQueueClient.emit).toHaveBeenCalledWith(
        InternalContextOptions.MESSAGE_RECEIVED,
        {
          From: testFrom,
          Body: testBody,
          eventId: mockEventId,
        },
      );
      expect(Logger.warn).not.toHaveBeenCalled();
    });

    it('should log warning and return early if From is missing', async () => {
      // Arrange
      const incompleteFrom = null;

      // Act
      await service.receiveMessage(incompleteFrom, testBody);

      // Assert
      expect(Logger.warn).toHaveBeenCalledWith(
        "Incomplete Twilio message received. Missing 'from' or 'body'.",
      );
      expect(mockLoggingService.messageReceived).not.toHaveBeenCalled();
      expect(mockQueueClient.emit).not.toHaveBeenCalled();
    });

    it('should log warning and return early if Body is missing', async () => {
      // Arrange
      const incompleteBody = ''; // or null or undefined

      // Act
      await service.receiveMessage(testFrom, incompleteBody);

      // Assert
      expect(Logger.warn).toHaveBeenCalledWith(
        "Incomplete Twilio message received. Missing 'from' or 'body'.",
      );
      expect(mockLoggingService.messageReceived).not.toHaveBeenCalled();
      expect(mockQueueClient.emit).not.toHaveBeenCalled();
    });

    it('should re-throw error if LoggingService.messageReceived fails', async () => {
      // Arrange
      const loggingError = new Error('Failed to log received message');
      mockLoggingService.messageReceived.mockRejectedValueOnce(loggingError);

      // Act & Assert
      await expect(service.receiveMessage(testFrom, testBody)).rejects.toThrow(
        loggingError,
      );
      expect(mockLoggingService.messageReceived).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.messageReceived).toHaveBeenCalledWith({
        from: testFrom,
        body: testBody,
      });
      expect(mockQueueClient.emit).not.toHaveBeenCalled(); // Should not emit if logging failed
      expect(Logger.warn).not.toHaveBeenCalled();
    });
  });
});
