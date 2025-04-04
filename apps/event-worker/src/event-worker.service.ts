import { QueueClient } from '@app/queue';
import { EventDataDto } from '@app/shared/dtos';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventWorkerService {
  constructor(private readonly queueClient: QueueClient) {}

  async emitEvent(data: EventDataDto): Promise<void> {
    if (!data) {
      throw new Error('EventDataDto is null or undefined');
    }

    const event = data.event;
    if (!event) {
      throw new Error('Event is null or undefined');
    }

    try {
      await this.queueClient.emit(event, data);
    } catch (error) {
      throw error;
    }
  }
}
