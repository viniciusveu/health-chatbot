import { Module } from '@nestjs/common';
import { EventWorkerController } from './event-worker.controller';
import { EventWorkerService } from './event-worker.service';
import { ConfigModule } from '@nestjs/config';
import { QueuesEnum } from '@app/shared/enums';
import { QueueModule } from '@app/queue';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/event-worker/.env'],
    }),
    QueueModule.register(QueuesEnum.CHATBOT),
  ],
  controllers: [EventWorkerController],
  providers: [EventWorkerService],
})
export class EventWorkerModule {}
