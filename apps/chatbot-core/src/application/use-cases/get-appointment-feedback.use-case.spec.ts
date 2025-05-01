import { Test, TestingModule } from '@nestjs/testing';
import { GetAppointmentFeedbackUseCase } from './get-appointment-feedback.use-case'; // Import the target use case
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
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

describe('GetAppointmentFeedbackUseCase', () => {
    let useCase: GetAppointmentFeedbackUseCase; // Type updated
    let appointmentRepository: AppointmentRepository;
    let loggingService: LoggingService;
    let queueClient: QueueClient;
    let generativeAI: GenAIApi;

    beforeEach(async () => {
        // Reset mocks before each test
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetAppointmentFeedbackUseCase, // Provide the target use case
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

        useCase = module.get<GetAppointmentFeedbackUseCase>(GetAppointmentFeedbackUseCase); // Get the target use case
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
            appointmentId: '789', // Different ID for clarity
            eventId: 1112,
            event: ContextOptions.COLLECT_FEEDBACK, // Assuming this context exists
        };

        const mockAppointment = {
            id: eventData.appointmentId,
            date_time: new Date('2024-12-01T09:00:00Z'),
            Patient: {
                id: 3,
                name: 'Carlos',
                phone: '+5521912345678',
                gender: 'Male',
                age: 50,
            },
            // Add other necessary appointment fields if they exist
        };

        const generatedFeedbackMessage =
            'Olá Carlos, como você avalia sua consulta de 01/12/2024 às 09:00? Responda com uma nota de 0 a 5.';

        it('should successfully process event, generate feedback request message, log, and emit to queue', async () => {
            // Arrange
            mockAppointmentRepository.getAppointmentById.mockResolvedValueOnce(
                mockAppointment,
            );
            mockGenerativeAI.generateContent.mockResolvedValueOnce(
                generatedFeedbackMessage,
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

            // 2. Check GenAI call
            expect(mockGenerativeAI.generateContent).toHaveBeenCalledTimes(1);
            expect(mockGenerativeAI.generateContent).toHaveBeenCalledWith(
                expect.stringContaining(mockAppointment.Patient.name),
            );
            expect(mockGenerativeAI.generateContent).toHaveBeenCalledWith(
                expect.stringContaining(mockAppointment.date_time.toString()),
            );
            expect(mockGenerativeAI.generateContent).toHaveBeenCalledWith(
                expect.stringContaining('how much they like the consultation from 0 to 5'), // Check for feedback intent in prompt
            );

            // 3. Check logging call (success)
            expect(mockLoggingService.eventProcessed).toHaveBeenCalledTimes(1);
            expect(mockLoggingService.eventProcessed).toHaveBeenCalledWith({
                id: eventData.eventId,
                contactInfo: mockAppointment.Patient.phone,
                msgContent: generatedFeedbackMessage, // Check for the feedback message
            });
            expect(mockLoggingService.eventProcessed).not.toHaveBeenCalledWith(
                expect.objectContaining({ msgError: expect.any(String) }),
            );

            // 4. Check queue emit call
            expect(mockQueueClient.emit).toHaveBeenCalledTimes(1);
            const expectedMessageData = new MessageDataDto(
                generatedFeedbackMessage,
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
            const genAiError = new Error('GenAI Feedback Error');
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

        // Add tests for logging failure and queue emit failure similar to the other spec files if needed
        // (They follow the same pattern, just adjusting the mocks and assertions)
    });
});