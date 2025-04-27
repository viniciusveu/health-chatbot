import { LoggingService } from '@app/logging';
import { QueueClient } from '@app/queue';
import { EventDataDto } from '@app/shared/dtos';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventWorkerService {
  constructor(
    private readonly queueClient: QueueClient,
    private readonly loggingService: LoggingService,
  ) {}

  async emitEvent(data: EventDataDto): Promise<void> {
    if (!data) {
      throw new Error('EventDataDto is null or undefined');
    }

    const event = data.event;
    if (!event) {
      throw new Error('Event is null or undefined');
    }

    try {
      const eventId = await this.loggingService.eventReceived({
        appointmentId: +data.appointmentId,
        contextType: event,
      });
      await this.queueClient.emit(event, { eventId, ...data });
    } catch (error) {
      throw new Error('Error while emitting event');
    }
  }
}
