import { Test, TestingModule } from '@nestjs/testing';
import { QueueClient } from './queue.client';

describe('QueueService', () => {
  let service: QueueClient;
  let queueClient: QueueClient;

  beforeEach(async () => {
    const mockQueueClient = {
        emit: jest.fn(),
      };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueClient,
        { provide: QueueClient, useValue: mockQueueClient },
      ],
    }).compile();
    queueClient = module.get<QueueClient>(QueueClient);
    service = module.get<QueueClient>(QueueClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
