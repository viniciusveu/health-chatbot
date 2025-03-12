import { EventDataDto } from '@app/shared/dtos';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EventWorkerService {
  constructor(
    @Inject('EVENT_WORKER') private readonly rabbitClient: ClientProxy,
  ) {}

  emitEvent(data: EventDataDto): void {
    if (!data) {
      throw new Error('EventDataDto is null or undefined');
    }

    const event = data.event;
    if (!event) {
      throw new Error('Event is null or undefined');
    }

    try {
      this.rabbitClient.emit(event, data);
    } catch (error) {
      console.error('Error while emitting event', error);
      throw error;
    }
  }
}
