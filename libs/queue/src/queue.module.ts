import { DynamicModule, Module } from '@nestjs/common';
import { QueueClient } from './queue.client';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  providers: [QueueClient],
  exports: [QueueClient],
})
export class QueueModule {
  static register(queueName: string): DynamicModule {
    return {
      module: QueueModule,
      imports: [
        ClientsModule.register([
          {
            name: 'QUEUE_CLIENT',
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
              queue: queueName,
              queueOptions: { durable: true },
            },
          },
        ]),
      ],
      providers: [QueueClient],
      exports: [QueueClient, ClientsModule],
    };
  }
}
