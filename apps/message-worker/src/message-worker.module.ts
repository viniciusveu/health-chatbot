import { Module } from '@nestjs/common';
import { MessageWorkerController } from './message-worker.controller';
import { MessageWorkerService } from './message-worker.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QueuesEnum } from '@app/shared/enums';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  controllers: [MessageWorkerController],
  providers: [MessageWorkerService],
})
export class MessageWorkerModule { }
