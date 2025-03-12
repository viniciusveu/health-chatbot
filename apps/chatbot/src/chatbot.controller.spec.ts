import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

describe('ChatbotController', () => {
  let chatbotController: ChatbotController;
  let chatbotService: ChatbotService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotController],
      providers: [
        {
          provide: ChatbotService,
          useValue: {
            confirmAppointment: jest.fn(),
          },
        },
      ],
    }).compile();

    chatbotController = app.get<ChatbotController>(ChatbotController);
    chatbotService = app.get<ChatbotService>(ChatbotService);
  });

  describe('it must be defined', () => {
    it('should be defined', () => {
      expect(chatbotController).toBeDefined();
      expect(chatbotService).toBeDefined();
    });
  });
});
