import { ClientProxy } from '@nestjs/microservices';
import { EventDataDto } from './dtos/event-data.dto';
import { EventWorkerService } from './event-worker.service';
import { ContextOptions } from '@app/shared';

describe('EventWorkerService', () => {
  let eventWorkerService: EventWorkerService;
  let rabbitClient: ClientProxy;

  beforeEach(() => {
    rabbitClient = {
      emit: jest.fn()
    } as any;

    eventWorkerService = new EventWorkerService(rabbitClient);
  });

  describe('emitEvent', () => {
    it('should emit event', () => {
      let data = {
        event: ContextOptions.APPOINTMENT_CREATED,
        patientId: '123',
        data: {}
      }
      let event = data.event;

      eventWorkerService.emitEvent(data);
      
      delete data.event;
      expect(rabbitClient.emit).toHaveBeenCalledWith(event, data);
    });

    it('should throw error when data is null or undefined', () => {
      let data = null;

      expect(() => eventWorkerService.emitEvent(data)).toThrowError('EventDataDto is null or undefined');
    });

    it('should throw error when event is null or undefined', () => {
      let data = new EventDataDto();
      data.event = null;

      expect(() => eventWorkerService.emitEvent(data)).toThrowError('Event is null or undefined');
    });

    it('should throw error when error while emitting event', () => {
      let data = new EventDataDto();
      data.event = ContextOptions.APPOINTMENT_CREATED;

      (rabbitClient.emit as jest.Mock).mockImplementation(() => {
        throw new Error('Error while emitting event');
      });

      expect(() => eventWorkerService.emitEvent(data)).toThrowError('Error while emitting event');
    });
  });
});
