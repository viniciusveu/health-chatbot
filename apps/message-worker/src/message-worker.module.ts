import { Module } from '@nestjs/common';
import { MessageWorkerController } from './message-worker.controller';
import { MessageWorkerService } from './message-worker.service';

@Module({
  imports: [],
  controllers: [MessageWorkerController],
  providers: [MessageWorkerService],
})
export class MessageWorkerModule {}
