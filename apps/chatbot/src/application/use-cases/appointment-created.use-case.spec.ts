import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentCreatedUseCase } from './appointment-created.use-case';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { LoggingService } from '@app/logging';
import { QueueClient } from '@app/queue';
import { GenAIApi } from '../../infrastructure/providers/genai-api.provider';
import { EventDataDto, MessageDataDto } from '@app/shared/dtos';
import { ContextOptions, InternalContextOptions } from '@app/shared/enums';

// Mock dependencies
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

describe('AppointmentCreatedUseCase', () => {
  let useCase: AppointmentCreatedUseCase;
  let appointmentRepository: AppointmentRepository;
  let loggingService: LoggingService;
  let queueClient: QueueClient;
  let generativeAI: GenAIApi;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentCreatedUseCase,
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

    useCase = module.get<AppointmentCreatedUseCase>(AppointmentCreatedUseCase);
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
      appointmentId: '123',
      eventId: 789,
      event: ContextOptions.APPOINTMENT_CREATED,
    };

    const mockAppointment = {
      id: eventData.appointmentId,
      date_time: new Date('2024-10-20T10:00:00Z'),
      Patient: {
        id: 1,
        name: 'João',
        phone: '+5519998682834',
        gender: 'Male',
        age: 30,
      },
      // Add other necessary appointment fields if they exist
    };

    const generatedMessage =
      'Olá João, seu agendamento para 20/10/2024 às 10:00 foi criado. Confirme por favor. Contato: 19998682834';

    it('should successfully process event, generate message, log, and emit to queue', async () => {
      // Arrange
      mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(
        mockAppointment,
      );
      mockGenerativeAI.generateContent.mockResolvedValueOnce(generatedMessage);
      mockLoggingService.eventProcessed.mockResolvedValueOnce(undefined); // Assume it resolves

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

      // 2. Check GenAI call
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledTimes(1);
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledWith(
        expect.stringContaining(mockAppointment.Patient.name), // Check if prompt includes key details
      );
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledWith(
        expect.stringContaining(mockAppointment.date_time.toString()),
      );

      // 3. Check logging call (success)
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledWith({
        id: eventData.eventId,
        contactInfo: mockAppointment.Patient.phone,
        msgContent: generatedMessage,
      });
      // Ensure error logging was NOT called
      expect(mockLoggingService.eventProcessed).not.toHaveBeenCalledWith(
        expect.objectContaining({ msgError: expect.any(String) }),
      );

      // 4. Check queue emit call
      expect(mockQueueClient.emit).toHaveBeenCalledTimes(1);
      const expectedMessageData = new MessageDataDto(
        generatedMessage,
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
      mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(null); // Simulate appointment not found

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

      // 2. Check error logging
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.any(Error), // Check if an Error object was logged
      );
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledWith({
        id: eventData.eventId,
        msgError: expect.stringContaining('Agendamento não encontrado.'), // Check if the specific error message is logged
      });

      // 3. Ensure subsequent steps were NOT called
      expect(mockGenerativeAI.generateContent).not.toHaveBeenCalled();
      expect(mockQueueClient.emit).not.toHaveBeenCalled();
      // Ensure success logging was NOT called
      expect(mockLoggingService.eventProcessed).not.toHaveBeenCalledWith(
        expect.objectContaining({ msgContent: expect.any(String) }),
      );
    });

    it('should log error if GenAI fails to generate content', async () => {
      // Arrange
      const genAiError = new Error('GenAI API Error');
      mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(
        mockAppointment,
      );
      mockGenerativeAI.generateContent.mockRejectedValueOnce(genAiError); // Simulate GenAI failure

      // Act
      await useCase.execute(eventData);

      // Assert
      // 1. Check repository and GenAI calls
      expect(
        mockAppointmentRepository.getAppointmentById,
      ).toHaveBeenCalledTimes(1);
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledTimes(1);

      // 2. Check error logging
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(genAiError);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledWith({
        id: eventData.eventId,
        msgError: `${genAiError}`,
      });

      // 3. Ensure queue emit was NOT called
      expect(mockQueueClient.emit).not.toHaveBeenCalled();
      // Ensure success logging was NOT called
      expect(mockLoggingService.eventProcessed).not.toHaveBeenCalledWith(
        expect.objectContaining({ msgContent: expect.any(String) }),
      );
    });

    it('should log error if loggingService.eventProcessed (success log) fails', async () => {
      // Arrange
      const loggingError = new Error('Logging Service Error');
      mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(
        mockAppointment,
      );
      mockGenerativeAI.generateContent.mockResolvedValueOnce(generatedMessage);
      // Simulate failure on the first expected call to eventProcessed
      mockLoggingService.eventProcessed.mockRejectedValueOnce(loggingError);

      // Act
      await useCase.execute(eventData);

      // Assert
      // 1. Check repository, GenAI, and first logging calls
      expect(
        mockAppointmentRepository.getAppointmentById,
      ).toHaveBeenCalledTimes(1);
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(2); // Called once for success (failed), once for error

      // 2. Check error logging
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(loggingError);
      // Check the second call (error logging)
      expect(mockLoggingService.eventProcessed).toHaveBeenNthCalledWith(2, {
        id: eventData.eventId,
        msgError: `${loggingError}`,
      });

      // 3. Ensure queue emit was NOT called
      expect(mockQueueClient.emit).not.toHaveBeenCalled();
    });

    it('should log error if queueClient.emit fails', async () => {
      // Arrange
      const emitError = new Error('Queue Emit Error');
      mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(
        mockAppointment,
      );
      mockGenerativeAI.generateContent.mockResolvedValueOnce(generatedMessage);
      mockLoggingService.eventProcessed.mockResolvedValueOnce(undefined); // First log succeeds
      mockQueueClient.emit.mockImplementationOnce(() => {
        // Simulate emit failure
        throw emitError;
      });

      // Act
      await useCase.execute(eventData);

      // Assert
      // 1. Check repository, GenAI, first logging, and emit calls
      expect(
        mockAppointmentRepository.getAppointmentById,
      ).toHaveBeenCalledTimes(1);
      expect(mockGenerativeAI.generateContent).toHaveBeenCalledTimes(1);
      expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(2); // Called once for success, once for error
      expect(mockQueueClient.emit).toHaveBeenCalledTimes(1); // Emit was called before throwing

      // 2. Check error logging
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(emitError);
      // Check the second call (error logging)
      expect(mockLoggingService.eventProcessed).toHaveBeenNthCalledWith(2, {
        id: eventData.eventId,
        msgError: `${emitError}`,
      });
    });
  });
});
