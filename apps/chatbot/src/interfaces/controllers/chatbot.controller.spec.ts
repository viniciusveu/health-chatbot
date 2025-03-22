import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotController } from './chatbot.controller';
import { ConfirmAppointmentUseCase } from '../../application/use-cases/confirm-appointment.use-case';
import { AppointmentCreatedUseCase } from '../../application/use-cases/appointment-created.use-case';
import { MessageReceivedUseCase } from '../../application/use-cases/message-received.use-case';


describe('ChatbotController', () => {
  let chatbotController: ChatbotController;

  let confirmAppointmentUseCase: ConfirmAppointmentUseCase;
  let appointmentCreatedUseCase: AppointmentCreatedUseCase;
  let messageReceivedUseCase: MessageReceivedUseCase;
  
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
      ],
    }).compile();

    chatbotController = app.get<ChatbotController>(ChatbotController);
    confirmAppointmentUseCase = app.get<ConfirmAppointmentUseCase>(ConfirmAppointmentUseCase);
    appointmentCreatedUseCase = app.get<AppointmentCreatedUseCase>(AppointmentCreatedUseCase);
    messageReceivedUseCase = app.get<MessageReceivedUseCase>(MessageReceivedUseCase);
  });

  describe('it must be defined', () => {
    it('should be defined', () => {
      expect(chatbotController).toBeDefined();
      expect(confirmAppointmentUseCase).toBeDefined();
      expect(appointmentCreatedUseCase).toBeDefined();
      expect(messageReceivedUseCase).toBeDefined();
    });
  });
});
