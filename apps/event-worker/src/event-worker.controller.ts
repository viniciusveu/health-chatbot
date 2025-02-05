import { Body, Controller, Post } from '@nestjs/common';
import { EventWorkerService } from './event-worker.service';
import { EventDataDto } from './dtos/event-data.dto';

@Controller()
export class EventWorkerController {
  constructor(private readonly eventWorkerService: EventWorkerService) {}

  @Post()
  emitEvent(@Body() data: EventDataDto): void {
    this.eventWorkerService.emitEvent(data);
  }
}
