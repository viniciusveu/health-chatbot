import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmAppointmentUseCase } from './confirm-appointment.use-case'; // Import the target use case
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { LoggingService } from '@app/logging';
import { QueueClient } from '@app/queue';
import { GenAIApi } from '../../infrastructure/providers/genai-api.provider';
import { EventDataDto, MessageDataDto } from '@app/shared/dtos';
import { ContextOptions, InternalContextOptions } from '@app/shared/enums'; // Assuming ContextOptions might be used in EventDataDto

// Mock dependencies (same structure as before)
const mockAppointmentRepository = {
  getAppointmentById: jest.fn(),
};

const mockLoggingService = {
  eventProcessed: jest.fn(),
};

const mockQueueClient = {
  emit: jest.fn(),
};

const mockGenerativeAI = {
  generateContent: jest.fn(),
};

// Spy on console.log
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ConfirmAppointmentUseCase', () => {
  let useCase: ConfirmAppointmentUseCase; // Type updated
  let appointmentRepository: AppointmentRepository;
  let loggingService: LoggingService;
  let queueClient: QueueClient;
  let generativeAI: GenAIApi;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmAppointmentUseCase, // Provide the target use case
        {
          provide: AppointmentRepository,
          useValue: mockAppointmentRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
        {
          provide: QueueClient,
          useValue: mockQueueClient,
        },
        {
          provide: GenAIApi,
          useValue: mockGenerativeAI,
        },
      ],
    }).compile();

    useCase = module.get<ConfirmAppointmentUseCase>(ConfirmAppointmentUseCase); // Get the target use case
    appointmentRepository = module.get<AppointmentRepository>(
      AppointmentRepository,
    );
    loggingService = module.get<LoggingService>(LoggingService);
    queueClient = module.get<QueueClient>(QueueClient);
    generativeAI = module.get<GenAIApi>(GenAIApi);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // ==========================================================================
  // Test Scenarios for execute()
  // ==========================================================================
  describe('execute', () => {
    const eventData: EventDataDto = {
      appointmentId: '456', // Different ID for clarity
      eventId: 910,
      event: ContextOptions.CONFIRM_APPOINTMENT, // Assuming this context exists
    };

    const mockAppointment = {
      id: eventData.appointmentId,
      date_time: new Date('2024-11-15T14:30:00Z'),
      Patient: {
        id: 2,
        name: 'Maria',
        phone: '+5511987654321',
        gender: 'Female',
        age: 45,
      },
      // Add other necessary appointment fields if they exist
    };

    const generatedConfirmationMessage =
      'Olá Maria, seu agendamento para 15/11/2024 às 14:30 está confirmado! Se precisar reagendar ou tiver dúvidas, entre em contato. Contato: 19998682834';

    it('should successfully process event, generate confirmation message, log, and emit to queue', async () => {
      // Arrange
      mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(
        mockAppointment,
      );
      mockGenerativeAI.generateContent.mockResolvedValueOnce(
        generatedConfirmationMessage,
      );
      mockLoggingService.eventProcessed.mockResolvedValueOnce(undefined);

      // Act
      await useCase.execute(eventData);

      // Assert
      // 1. Check repository call
      expect(
        mockAppointmentRepository.getAppointmentById,
      ).toHaveBeenCalledTimes(1);
      expect(mockAppointmentRepository.getAppointmentById).toHaveBeenCalledWith(
        eventData.appointmentId,
      );

      // 2. Check GenAI call (prompt details might differ slightly for confirmation)
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledTimes(1);
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledWith(
        expect.stringContaining(mockAppointment.Patient.name),
      );
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledWith(
        expect.stringContaining(mockAppointment.date_time.toString()),
      );
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('want to confirm'), // Check for confirmation intent in prompt
      );

      // 3. Check logging call (success)
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledWith({
        id: eventData.eventId,
        contactInfo: mockAppointment.Patient.phone,
        msgContent: generatedConfirmationMessage, // Check for the confirmation message
      });
      expect(mockLoggingService.eventProcessed).not.toHaveBeenCalledWith(
        expect.objectContaining({ msgError: expect.any(String) }),
      );

      // 4. Check queue emit call
      expect(mockQueueClient.emit).toHaveBeenCalledTimes(1);
      const expectedMessageData = new MessageDataDto(
        generatedConfirmationMessage,
        mockAppointment.Patient.phone,
        eventData.eventId,
      );
      expect(mockQueueClient.emit).toHaveBeenCalledWith(
        InternalContextOptions.SEND_MESSAGE,
        expectedMessageData,
      );

      // 5. Check console log was NOT called
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log error if appointment is not found', async () => {
      // Arrange
      mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(null);

      // Act
      await useCase.execute(eventData);

      // Assert
      expect(
        mockAppointmentRepository.getAppointmentById,
      ).toHaveBeenCalledTimes(1);
      expect(mockAppointmentRepository.getAppointmentById).toHaveBeenCalledWith(
        eventData.appointmentId,
      );
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledWith({
        id: eventData.eventId,
        msgError: expect.stringContaining('Agendamento não encontrado.'),
      });
      expect(mockGenerativeAI.generateContent).not.toHaveBeenCalled();
      expect(mockQueueClient.emit).not.toHaveBeenCalled();
      expect(mockLoggingService.eventProcessed).not.toHaveBeenCalledWith(
        expect.objectContaining({ msgContent: expect.any(String) }),
      );
    });

    it('should log error if GenAI fails to generate content', async () => {
      // Arrange
      const genAiError = new Error('GenAI Confirmation Error');
      mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(
        mockAppointment,
      );
      mockGenerativeAI.generateContent.mockRejectedValueOnce(genAiError);

      // Act
      await useCase.execute(eventData);

      // Assert
      expect(
        mockAppointmentRepository.getAppointmentById,
      ).toHaveBeenCalledTimes(1);
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(genAiError);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledWith({
        id: eventData.eventId,
        msgError: `${genAiError}`,
      });
      expect(mockQueueClient.emit).not.toHaveBeenCalled();
      expect(mockLoggingService.eventProcessed).not.toHaveBeenCalledWith(
        expect.objectContaining({ msgContent: expect.any(String) }),
      );
    });

    it('should log error if loggingService.eventProcessed (success log) fails', async () => {
      // Arrange
      const loggingError = new Error('Logging Confirmation Error');
      mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(
        mockAppointment,
      );
      mockGenerativeAI.generateContent.mockResolvedValueOnce(
        generatedConfirmationMessage,
      );
      mockLoggingService.eventProcessed.mockRejectedValueOnce(loggingError); // Fail on first call

      // Act
      await useCase.execute(eventData);

      // Assert
      expect(
        mockAppointmentRepository.getAppointmentById,
      ).toHaveBeenCalledTimes(1);
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(2); // Success (failed) + Error
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(loggingError);
      expect(mockLoggingService.eventProcessed).toHaveBeenNthCalledWith(2, {
        id: eventData.eventId,
        msgError: `${loggingError}`,
      });
      expect(mockQueueClient.emit).not.toHaveBeenCalled();
    });

    it('should log error if queueClient.emit fails', async () => {
      // Arrange
      const emitError = new Error('Queue Emit Confirmation Error');
      mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(
        mockAppointment,
      );
      mockGenerativeAI.generateContent.mockResolvedValueOnce(
        generatedConfirmationMessage,
      );
      mockLoggingService.eventProcessed.mockResolvedValueOnce(undefined); // First log succeeds
      mockQueueClient.emit.mockImplementationOnce(() => {
        throw emitError;
      });

      // Act
      await useCase.execute(eventData);

      // Assert
      expect(
        mockAppointmentRepository.getAppointmentById,
      ).toHaveBeenCalledTimes(1);
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(2); // Success + Error
      expect(mockQueueClient.emit).toHaveBeenCalledTimes(1); // Called before throwing
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(emitError);
      expect(mockLoggingService.eventProcessed).toHaveBeenNthCalledWith(2, {
        id: eventData.eventId,
        msgError: `${emitError}`,
      });
    });
  });
});
