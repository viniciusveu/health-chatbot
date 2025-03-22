import { Module } from '@nestjs/common';
import { EventWorkerController } from './event-worker.controller';
import { EventWorkerService } from './event-worker.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { QueuesEnum } from '@app/shared/enums';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/event-worker/.env'],
    }),
    ClientsModule.register([
      {
        name: 'CHATBOT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: QueuesEnum.CHATBOT,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [EventWorkerController],
  providers: [EventWorkerService],
})
export class EventWorkerModule {}
