import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

describe('AppController', () => {
  let chatbotController: ChatbotController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotController],
      providers: [ChatbotService],
    }).compile();

    chatbotController = app.get<ChatbotController>(ChatbotController);
  });

  describe('root', () => {

  });
});
