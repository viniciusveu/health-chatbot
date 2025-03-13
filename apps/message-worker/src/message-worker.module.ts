import { Module } from '@nestjs/common';
import { MessageWorkerController } from './message-worker.controller';
import { MessageWorkerService } from './message-worker.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [MessageWorkerController],
  providers: [MessageWorkerService],
})
export class MessageWorkerModule {}
