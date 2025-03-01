import { Test, TestingModule } from '@nestjs/testing';
import { EventWorkerController } from './event-worker.controller';
import { EventWorkerService } from './event-worker.service';
import { EventDataDto } from '@app/shared/dtos';

describe('EventWorkerController', () => {
  let eventWorkerController: EventWorkerController;
  let eventWorkerService: EventWorkerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventWorkerController],
      providers: [
        {
          provide: EventWorkerService,
          useValue: {
            emitEvent: jest.fn(),
          },
        }
      ],
    }).compile();

    eventWorkerController = app.get<EventWorkerController>(EventWorkerController);
    eventWorkerService = app.get<EventWorkerService>(EventWorkerService);
  });

  describe('EventWorkerController', () => {
    it('should send event to EventWorkerService"', () => {
      let data = new EventDataDto();
      jest.spyOn(eventWorkerService, 'emitEvent');

      expect(eventWorkerController.emitEvent(data)).toBeUndefined();
      expect(eventWorkerService.emitEvent).toHaveBeenCalledWith(data);
    });
  });
});
