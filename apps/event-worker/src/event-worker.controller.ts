import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EventWorkerService } from './event-worker.service';
import { EventDataDto } from '@app/shared/dtos';
import { JwtAuthGuard } from '@app/auth';

@Controller('events')
export class EventWorkerController {
  constructor(private readonly eventWorkerService: EventWorkerService) {}

  @Post('emit')
  @UseGuards(JwtAuthGuard)
  emitEvent(@Body() data: EventDataDto): void {
    this.eventWorkerService.emitEvent(data);
  }
}
