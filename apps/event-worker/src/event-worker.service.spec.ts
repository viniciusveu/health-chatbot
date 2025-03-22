import { EventWorkerService } from './event-worker.service';
import { ContextOptions } from '@app/shared/enums';
import { EventDataDto } from '@app/shared/dtos';
import { QueueClient } from '@app/queue';
import { Test, TestingModule } from '@nestjs/testing';

describe('EventWorkerService', () => {
  let eventWorkerService: EventWorkerService;
  let queueClient: QueueClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventWorkerService,
        {
          provide: QueueClient,
          useValue: {
            emit: jest.fn().mockImplementation((event, data) => {
              console.log(
                `Mocked emit: event=${event}, data=${JSON.stringify(data)}`,
              );
              return Promise.resolve();
            }),
          },
        },
      ],
    }).compile();

    queueClient = module.get<QueueClient>(QueueClient);
    eventWorkerService = module.get<EventWorkerService>(EventWorkerService);
  });

  it('should be defined', () => {
    expect(eventWorkerService).toBeDefined();
    expect(queueClient).toBeDefined();
  });

  describe('emitEvent', () => {
    it('should emit event successfully', async () => {
      const data = {
        event: ContextOptions.APPOINTMENT_CREATED,
        patientId: '123',
        appointmentId: '456',
      };
      const event = data.event;

      jest.spyOn(queueClient, 'emit').mockResolvedValueOnce(undefined);

      await eventWorkerService.emitEvent(data);

      const expectedPayload = { ...data };

      expect(queueClient.emit).toHaveBeenCalledWith(event, expectedPayload);
    });

    it('should throw error when data is null', async () => {
      await expect(eventWorkerService.emitEvent(null)).rejects.toThrow(
        'EventDataDto is null or undefined',
      );
    });

    it('should throw error when event is null', async () => {
      const data = new EventDataDto();
      data.event = null;

      await expect(eventWorkerService.emitEvent(data)).rejects.toThrow(
        'Event is null or undefined',
      );
    });

    it('should throw error when emit fails', async () => {
      const data = new EventDataDto();
      data.event = ContextOptions.APPOINTMENT_CREATED;

      jest
        .spyOn(queueClient, 'emit')
        .mockRejectedValueOnce(new Error('Error while emitting event'));

      await expect(eventWorkerService.emitEvent(data)).rejects.toThrow(
        'Error while emitting event',
      );
    });
  });
});
