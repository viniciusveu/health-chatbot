import { Module } from '@nestjs/common';
import { EventWorkerController } from './event-worker.controller';
import { EventWorkerService } from './event-worker.service';
import { ConfigModule } from '@nestjs/config';
import { QueuesEnum } from '@app/shared/enums';
import { QueueModule } from '@app/queue';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@app/logging/logging.interceptor';
import { AuthModule } from '@app/auth';
import { LoggingModule } from '@app/logging';

@Module({
  imports: [
    AuthModule,
    LoggingModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/event-worker/.env'],
    }),
    QueueModule.register(QueuesEnum.CHATBOT),
  ],
  controllers: [EventWorkerController],
  providers: [
    EventWorkerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class EventWorkerModule {}
