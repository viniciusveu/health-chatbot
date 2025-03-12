import { ClientProxy } from '@nestjs/microservices';
import { EventWorkerService } from './event-worker.service';
import { ContextOptions } from '@app/shared/enums';
import { EventDataDto } from '@app/shared/dtos';

describe('EventWorkerService', () => {
  let eventWorkerService: EventWorkerService;
  let rabbitClient: ClientProxy;

  beforeEach(() => {
    rabbitClient = {
      emit: jest.fn(),
    } as any;

    eventWorkerService = new EventWorkerService(rabbitClient);
  });

  describe('emitEvent', () => {
    it('should emit event', () => {
      const data = {
        event: ContextOptions.APPOINTMENT_CREATED,
        patientId: '123',
        appointmentId: '456',
      };
      const event = data.event;

      eventWorkerService.emitEvent(data);

      delete data.event;
      expect(rabbitClient.emit).toHaveBeenCalledWith(event, data);
    });

    it('should throw error when data is null or undefined', () => {
      const data = null;

      expect(() => eventWorkerService.emitEvent(data)).toThrowError(
        'EventDataDto is null or undefined',
      );
    });

    it('should throw error when event is null or undefined', () => {
      const data = new EventDataDto();
      data.event = null;

      expect(() => eventWorkerService.emitEvent(data)).toThrowError(
        'Event is null or undefined',
      );
    });

    it('should throw error when error while emitting event', () => {
      const data = new EventDataDto();
      data.event = ContextOptions.APPOINTMENT_CREATED;

      (rabbitClient.emit as jest.Mock).mockImplementation(() => {
        throw new Error('Error while emitting event');
      });

      expect(() => eventWorkerService.emitEvent(data)).toThrowError(
        'Error while emitting event',
      );
    });
  });
});
