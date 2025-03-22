import { Test, TestingModule } from '@nestjs/testing';
import { MessageWorkerController } from './message-worker.controller';
import { MessageWorkerService } from './message-worker.service';

describe('MessageWorkerController', () => {
  let messageWorkerController: MessageWorkerController;
  let messageWorkerService: MessageWorkerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessageWorkerController],
      providers: [MessageWorkerController, 
        {
          provide: MessageWorkerService,
          useValue: {
            sendMessage: jest.fn(),
            receiveMessage: jest.fn(),
          },
        }
      ],
    }).compile();

    messageWorkerController = app.get<MessageWorkerController>(
      MessageWorkerController,
    );
    messageWorkerService = app.get<MessageWorkerService>(MessageWorkerService);
  });

  it('should be defined', () => {
    expect(messageWorkerController).toBeDefined();
    expect(messageWorkerService).toBeDefined();
  });
});
