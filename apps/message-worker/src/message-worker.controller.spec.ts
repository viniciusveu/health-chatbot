import { Test, TestingModule } from '@nestjs/testing';
import { MessageWorkerController } from './message-worker.controller';
import { MessageWorkerService } from './message-worker.service';

describe('MessageWorkerController', () => {
  let messageWorkerController: MessageWorkerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessageWorkerController],
      providers: [MessageWorkerService],
    }).compile();

    messageWorkerController = app.get<MessageWorkerController>(MessageWorkerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
    });
  });
});
