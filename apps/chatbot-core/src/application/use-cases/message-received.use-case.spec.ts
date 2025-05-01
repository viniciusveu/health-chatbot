import { Test, TestingModule } from '@nestjs/testing';
import { MessageReceivedUseCase } from './message-received.use-case';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { FeedbackRepository } from '../../infrastructure/repositories/feedback.repository';
import { LoggingService } from '@app/logging';
import { QueueClient } from '@app/queue';
import { LogDto, MessageDataDto, ReceivedMessageDto } from '@app/shared/dtos';
import { ContextOptions, InternalContextOptions } from '@app/shared/enums';
import { FeedbackType } from '@app/shared/enums/feedback-type.enum';
import { Feedback } from '@prisma/client';

// Mock dependencies
const mockAppointmentRepository = {
    confirmAppointmentById: jest.fn(),
    cancelAppointmentById: jest.fn(),
};

const mockFeedbackRepository = {
    create: jest.fn(),
};

const mockLoggingService = {
    getLastLogByContactInfo: jest.fn(),
    messageProcessed: jest.fn(),
    eventProcessed: jest.fn(),
};

const mockQueueClient = {
    emit: jest.fn(),
};

// Spy on console.log
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

describe('MessageReceivedUseCase', () => {
    let useCase: MessageReceivedUseCase;
    let appointmentRepository: AppointmentRepository;
    let feedbackRepository: FeedbackRepository;
    let loggingService: LoggingService;
    let queueClient: QueueClient;

    const contactNumber = '1234567890';
    const receivedMessageData: ReceivedMessageDto = {
        From: `whatsapp:+55${contactNumber}`, // Example format
        Body: '', // Will be set per test
        eventId: 12345,
        // Add other required fields from ReceivedMessageDto if any
    };

    const baseLastLog = {
        id: 987,
        appointmentId: 123,
        contactInfo: contactNumber,
        contextType: ContextOptions.APPOINTMENT_CREATED, // Default, will be overridden
        msgContent: 'Previous message sent',
        receivedAt: new Date(),
        // Add other required fields from LogDto if any
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessageReceivedUseCase,
                {
                    provide: AppointmentRepository,
                    useValue: mockAppointmentRepository,
                },
                {
                    provide: FeedbackRepository,
                    useValue: mockFeedbackRepository,
                },
                {
                    provide: LoggingService,
                    useValue: mockLoggingService,
                },
                {
                    provide: QueueClient,
                    useValue: mockQueueClient,
                },
            ],
        }).compile();

        useCase = module.get<MessageReceivedUseCase>(MessageReceivedUseCase);
        appointmentRepository = module.get<AppointmentRepository>(
            AppointmentRepository,
        );
        feedbackRepository = module.get<FeedbackRepository>(FeedbackRepository);
        loggingService = module.get<LoggingService>(LoggingService);
        queueClient = module.get<QueueClient>(QueueClient);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    // ==========================================================================
    // Test Scenarios for execute()
    // ==========================================================================
    describe('execute', () => {
        // --- Collect Feedback Context ---
        describe('when last context is COLLECT_FEEDBACK', () => {
            const lastLogFeedback = {
                ...baseLastLog,
                contextType: ContextOptions.COLLECT_FEEDBACK,
            };

            it('should process valid feedback (rating 4), create feedback, log, and emit thank you message', async () => {
                // Arrange
                const rating = '4';
                const messageData = { ...receivedMessageData, Body: rating };
                mockLoggingService.getLastLogByContactInfo.mockResolvedValueOnce(
                    lastLogFeedback,
                );
                mockFeedbackRepository.create.mockResolvedValueOnce({} as Feedback); // Simulate successful creation
                mockLoggingService.messageProcessed.mockResolvedValueOnce(undefined);

                // Act
                await useCase.execute(messageData);

                // Assert
                expect(loggingService.getLastLogByContactInfo).toHaveBeenCalledWith(
                    contactNumber,
                );
                expect(feedbackRepository.create).toHaveBeenCalledTimes(1);
                expect(feedbackRepository.create).toHaveBeenCalledWith({
                    appointmentId: lastLogFeedback.appointmentId,
                    type: FeedbackType.APPOINTMENT_FEEDBACK,
                    rating: parseInt(rating),
                });
                expect(loggingService.messageProcessed).toHaveBeenCalledTimes(1);
                expect(loggingService.messageProcessed).toHaveBeenCalledWith({
                    id: messageData.eventId,
                    contextType: ContextOptions.COLLECT_FEEDBACK,
                    appointmentId: lastLogFeedback.appointmentId,
                });
                expect(queueClient.emit).toHaveBeenCalledTimes(1);
                expect(queueClient.emit).toHaveBeenCalledWith(
                    InternalContextOptions.SEND_MESSAGE,
                    expect.objectContaining({
                        message: 'Obrigado pela avaliação.',
                        contact: '+55' + contactNumber,
                    }),
                );
                expect(loggingService.eventProcessed).not.toHaveBeenCalled(); // No error logging
            });

            it('should handle invalid feedback ("abc"), log, and emit validation error message', async () => {
                // Arrange
                const invalidRating = 'abc';
                const messageData = { ...receivedMessageData, Body: invalidRating };
                mockLoggingService.getLastLogByContactInfo.mockResolvedValueOnce(
                    lastLogFeedback,
                );
                mockLoggingService.messageProcessed.mockResolvedValueOnce(undefined);

                // Act
                await useCase.execute(messageData);

                // Assert
                expect(loggingService.getLastLogByContactInfo).toHaveBeenCalledWith(
                    contactNumber,
                );
                expect(feedbackRepository.create).not.toHaveBeenCalled(); // Should not create feedback
                expect(loggingService.messageProcessed).toHaveBeenCalledTimes(1);
                expect(queueClient.emit).toHaveBeenCalledTimes(1);
                expect(queueClient.emit).toHaveBeenCalledWith(
                    InternalContextOptions.SEND_MESSAGE,
                    expect.objectContaining({
                        message:
                            'Sua nota deve ser entre 0 e 5. Por favor, envie um valor válido.',
                        contact: '+55' + contactNumber,
                    }),
                );
                expect(loggingService.eventProcessed).not.toHaveBeenCalled();
            });
        });

        // --- Confirm Appointment Context ---
        describe('when last context is CONFIRM_APPOINTMENT', () => {
            const lastLogConfirm = {
                ...baseLastLog,
                contextType: ContextOptions.CONFIRM_APPOINTMENT,
            };

            it('should process positive confirmation ("Sim"), confirm appointment, log, and emit confirmation message', async () => {
                // Arrange
                const confirmation = 'Sim';
                const messageData = { ...receivedMessageData, Body: confirmation };
                mockLoggingService.getLastLogByContactInfo.mockResolvedValueOnce(
                    lastLogConfirm as LogDto,
                );
                mockAppointmentRepository.confirmAppointmentById.mockResolvedValueOnce(
                    undefined,
                );
                mockLoggingService.messageProcessed.mockResolvedValueOnce(undefined);

                // Act
                await useCase.execute(messageData);

                // Assert
                expect(loggingService.getLastLogByContactInfo).toHaveBeenCalledWith(
                    contactNumber,
                );
                expect(
                    appointmentRepository.confirmAppointmentById,
                ).toHaveBeenCalledTimes(1);
                expect(appointmentRepository.confirmAppointmentById).toHaveBeenCalledWith(
                    lastLogConfirm.appointmentId,
                );
                expect(
                    appointmentRepository.cancelAppointmentById,
                ).not.toHaveBeenCalled();
                expect(loggingService.messageProcessed).toHaveBeenCalledTimes(1);
                expect(queueClient.emit).toHaveBeenCalledTimes(1);
                expect(queueClient.emit).toHaveBeenCalledWith(
                    InternalContextOptions.SEND_MESSAGE,
                    expect.objectContaining({
                        message: 'Seu agendamento foi confirmado. Obrigado!',
                        contact: '+55' + contactNumber,
                    }),
                );
                expect(loggingService.eventProcessed).not.toHaveBeenCalled();
            });

            it('should process negative confirmation ("não"), cancel appointment, log, and emit cancellation message', async () => {
                // Arrange
                const cancellation = 'não';
                const messageData = { ...receivedMessageData, Body: cancellation };
                mockLoggingService.getLastLogByContactInfo.mockResolvedValueOnce(
                    lastLogConfirm as LogDto,
                );
                mockAppointmentRepository.cancelAppointmentById.mockResolvedValueOnce(
                    undefined,
                );
                mockLoggingService.messageProcessed.mockResolvedValueOnce(undefined);

                // Act
                await useCase.execute(messageData);

                // Assert
                expect(loggingService.getLastLogByContactInfo).toHaveBeenCalledWith(
                    contactNumber,
                );
                expect(
                    appointmentRepository.cancelAppointmentById,
                ).toHaveBeenCalledTimes(1);
                expect(appointmentRepository.cancelAppointmentById).toHaveBeenCalledWith(
                    lastLogConfirm.appointmentId,
                );
                expect(
                    appointmentRepository.confirmAppointmentById,
                ).not.toHaveBeenCalled();
                expect(loggingService.messageProcessed).toHaveBeenCalledTimes(1);
                expect(queueClient.emit).toHaveBeenCalledTimes(1);
                expect(queueClient.emit).toHaveBeenCalledWith(
                    InternalContextOptions.SEND_MESSAGE,
                    expect.objectContaining({
                        message:
                            'Seu agendamento foi cancelado. Obrigado! \nCaso tenha cancelado por engano, entre em contato no 0500.',
                        contact: '+55' + contactNumber,
                    }),
                );
                expect(loggingService.eventProcessed).not.toHaveBeenCalled();
            });

            it('should handle invalid confirmation ("talvez"), log, and emit validation error message', async () => {
                // Arrange
                const invalidResponse = 'talvez';
                const messageData = { ...receivedMessageData, Body: invalidResponse };
                mockLoggingService.getLastLogByContactInfo.mockResolvedValueOnce(
                    lastLogConfirm,
                );
                mockLoggingService.messageProcessed.mockResolvedValueOnce(undefined);

                // Act
                await useCase.execute(messageData);

                // Assert
                expect(loggingService.getLastLogByContactInfo).toHaveBeenCalledWith(
                    contactNumber,
                );
                expect(
                    appointmentRepository.confirmAppointmentById,
                ).not.toHaveBeenCalled();
                expect(
                    appointmentRepository.cancelAppointmentById,
                ).not.toHaveBeenCalled();
                expect(loggingService.messageProcessed).toHaveBeenCalledTimes(1);
                expect(queueClient.emit).toHaveBeenCalledTimes(1);
                expect(queueClient.emit).toHaveBeenCalledWith(
                    InternalContextOptions.SEND_MESSAGE,
                    expect.objectContaining({
                        message:
                            'Por favor, responda apenas com sim ou não. \nEm caso de dúvidas, entre em contato no 0500.',
                        contact: '+55' + contactNumber,
                    }),
                );
                expect(loggingService.eventProcessed).not.toHaveBeenCalled();
            });
        });

        // --- Error Handling ---
        it('should log error if getLastLogByContactInfo fails', async () => {
            // Arrange
            const error = new Error('DB Log Error');
            mockLoggingService.getLastLogByContactInfo.mockRejectedValueOnce(error);

            // Act
            await useCase.execute(receivedMessageData);

            // Assert
            expect(loggingService.getLastLogByContactInfo).toHaveBeenCalledWith(
                contactNumber,
            );
            expect(consoleLogSpy).toHaveBeenCalledWith(error);
            expect(loggingService.eventProcessed).toHaveBeenCalledTimes(1);
            expect(loggingService.eventProcessed).toHaveBeenCalledWith({
                id: receivedMessageData.eventId,
                msgError: `${error}`,
            });
            expect(feedbackRepository.create).not.toHaveBeenCalled();
            expect(appointmentRepository.confirmAppointmentById).not.toHaveBeenCalled();
            expect(appointmentRepository.cancelAppointmentById).not.toHaveBeenCalled();
            expect(loggingService.messageProcessed).not.toHaveBeenCalled();
            expect(queueClient.emit).not.toHaveBeenCalled();
        });

        it('should log error if context type is invalid/unhandled', async () => {
            // Arrange
            const invalidContextLog = {
                ...baseLastLog,
                contextType: 'INVALID_CONTEXT' as any, // Force an invalid type
            };
            mockLoggingService.getLastLogByContactInfo.mockResolvedValueOnce(invalidContextLog as LogDto);

            // Act
            await useCase.execute(receivedMessageData);

            // Assert
            expect(loggingService.getLastLogByContactInfo).toHaveBeenCalledWith(contactNumber);
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error)); // The specific error thrown
            expect(loggingService.eventProcessed).toHaveBeenCalledTimes(1);
            expect(loggingService.eventProcessed).toHaveBeenCalledWith({
                id: receivedMessageData.eventId,
                msgError: expect.stringContaining('Invalid context type'),
            });
            expect(queueClient.emit).not.toHaveBeenCalled();
        });

        // Add more specific error tests for repository failures, queue emit failures etc. if needed,
        // following the pattern in the other spec files.
    });
});