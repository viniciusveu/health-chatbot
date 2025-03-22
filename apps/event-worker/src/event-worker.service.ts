import { QueueClient } from '@app/queue';
import { EventDataDto } from '@app/shared/dtos';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EventWorkerService {
  constructor(
    private readonly queueClient: QueueClient,
  ) {}

  async emitEvent(data: EventDataDto): Promise<void> {
    if (!data) {
      throw new Error('EventDataDto is null or undefined');
    }

    const event = data.event;
    if (!event) {
      throw new Error('Event is null or undefined');
    }

    Logger.log(
      'Transmiting message to chatbot: ' +
        event +
        ' with data: ' +
        JSON.stringify(data),
      'EventWorkerService',
    );

    try {
      await this.queueClient.emit(event, data);
    } catch (error) {
      console.error('Error while emitting event', error);
      throw error;
    }
  }
}
