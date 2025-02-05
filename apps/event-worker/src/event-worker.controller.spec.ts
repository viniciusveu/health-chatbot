import { Test, TestingModule } from '@nestjs/testing';
import { EventWorkerController } from './event-worker.controller';
import { EventWorkerService } from './event-worker.service';

describe('EventWorkerController', () => {
  let eventWorkerController: EventWorkerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventWorkerController],
      providers: [EventWorkerService],
    }).compile();

    eventWorkerController = app.get<EventWorkerController>(EventWorkerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
    });
  });
});
