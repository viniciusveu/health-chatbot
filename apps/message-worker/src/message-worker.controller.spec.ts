import { Test, TestingModule } from '@nestjs/testing';
import { MessageWorkerController } from './message-worker.controller';
import { MessageWorkerService } from './message-worker.service';
import { ConfigService } from '@nestjs/config';

describe('MessageWorkerController', () => {
  let messageWorkerController: MessageWorkerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessageWorkerController],
      providers: [MessageWorkerService, ConfigService],
    }).compile();

    messageWorkerController = app.get<MessageWorkerController>(
      MessageWorkerController,
    );
  });

  it('should be defined', () => {
    expect(messageWorkerController).toBeDefined();
  });
});
