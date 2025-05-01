import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotController } from './chatbot.controller';
import { ConfirmAppointmentUseCase } from '../../application/use-cases/confirm-appointment.use-case';
import { AppointmentCreatedUseCase } from '../../application/use-cases/appointment-created.use-case';
import { MessageReceivedUseCase } from '../../application/use-cases/message-received.use-case';
import { EventDataDto, ReceivedMessageDto } from '@app/shared/dtos';
import { ContextOptions } from '@app/shared/enums';
import { GetAppointmentFeedbackUseCase } from '../../application/use-cases/get-appointment-feedback.use-case';

describe('ChatbotController', () => {
  let chatbotController: ChatbotController;

  let confirmAppointmentUseCase: ConfirmAppointmentUseCase;
  let appointmentCreatedUseCase: AppointmentCreatedUseCase;
  let messageReceivedUseCase: MessageReceivedUseCase;
  let getAppointmentFeedbackUseCase: GetAppointmentFeedbackUseCase;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotController],
      providers: [
        {
          provide: ConfirmAppointmentUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: AppointmentCreatedUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: MessageReceivedUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAppointmentFeedbackUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    chatbotController = app.get<ChatbotController>(ChatbotController);
    confirmAppointmentUseCase = app.get<ConfirmAppointmentUseCase>(
      ConfirmAppointmentUseCase,
    );
    appointmentCreatedUseCase = app.get<AppointmentCreatedUseCase>(
      AppointmentCreatedUseCase,
    );
    messageReceivedUseCase = app.get<MessageReceivedUseCase>(
      MessageReceivedUseCase,
    );
    getAppointmentFeedbackUseCase = app.get<GetAppointmentFeedbackUseCase>(
      GetAppointmentFeedbackUseCase,
    );
  });

  describe('it must be defined', () => {
    it('should be defined', () => {
      expect(chatbotController).toBeDefined();
      expect(confirmAppointmentUseCase).toBeDefined();
      expect(appointmentCreatedUseCase).toBeDefined();
      expect(messageReceivedUseCase).toBeDefined();
      expect(getAppointmentFeedbackUseCase).toBeDefined();
    });
  });

  describe('messageReceived', () => {
    it('should call messageReceivedUseCase.execute with the correct message', async () => {
      const message: ReceivedMessageDto = {
        eventId: 123,
        From: 'from',
        Body: 'body',
      };
      await chatbotController.messageReceived(message);
      expect(messageReceivedUseCase.execute).toHaveBeenCalledWith(message);
    });
  });

  describe('appointmentCreated', () => {
    it('should call appointmentCreatedUseCase.execute with the correct message', async () => {
      const message: EventDataDto = {
        event: ContextOptions.APPOINTMENT_CREATED,
        appointmentId: 'some id',
      };
      await chatbotController.appointmentCreated(message);
      expect(appointmentCreatedUseCase.execute).toHaveBeenCalledWith(message);
    });
  });

  describe('confirmAppointment', () => {
    it('should call confirmAppointmentUseCase.execute with the correct message', async () => {
      const message: EventDataDto = {
        event: ContextOptions.APPOINTMENT_CREATED,
        appointmentId: 'some id',
      };
      await chatbotController.confirmAppointment(message);
      expect(confirmAppointmentUseCase.execute).toHaveBeenCalledWith(message);
    });
  });

  describe('getAppointmentFeedback', () => {
    it('should call getAppointmentFeedbackUseCase.execute with the correct message', async () => {
      const message: EventDataDto = {
        event: ContextOptions.COLLECT_FEEDBACK,
        appointmentId: 'some id',
      };
      await chatbotController.getAppointmentFeedback(message);
      expect(getAppointmentFeedbackUseCase.execute).toHaveBeenCalledWith(
        message,
      );
    });
  });
});
