import { Module } from '@nestjs/common';
import { MessageWorkerController } from './message-worker.controller';
import { MessageWorkerService } from './message-worker.service';
import { ConfigModule } from '@nestjs/config';
import { QueuesEnum } from '@app/shared/enums';
import { QueueModule } from '@app/queue';
import { LoggingModule } from '@app/logging';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    QueueModule.register(QueuesEnum.CHATBOT),
    LoggingModule,
  ],
  controllers: [MessageWorkerController],
  providers: [MessageWorkerService],
})
export class MessageWorkerModule {}
