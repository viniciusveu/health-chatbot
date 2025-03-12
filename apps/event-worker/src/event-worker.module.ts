import { Module } from '@nestjs/common';
import { EventWorkerController } from './event-worker.controller';
import { EventWorkerService } from './event-worker.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/event-worker/.env'],
    }),
    ClientsModule.register([
      {
        name: 'EVENT_WORKER',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'chatbot_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [EventWorkerController],
  providers: [EventWorkerService],
})
export class EventWorkerModule {}
