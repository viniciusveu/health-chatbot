import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventDataDto } from './dtos/event-data.dto';

@Injectable()
export class EventWorkerService {
  constructor(@Inject('EVENT_WORKER') private readonly rabbitClient: ClientProxy) {}

  emitEvent(data: EventDataDto): void {
    const event = data.event;
    delete data.event;
    
    this.rabbitClient.emit(event, data);
  }
}
