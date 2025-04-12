import { DynamicModule, Module } from '@nestjs/common';
import { QueueClient } from './queue.client';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QueuesEnum } from '@app/shared/enums';
import { generateQueueOptions } from '@app/shared/helpers';

@Module({
  providers: [QueueClient],
  exports: [QueueClient],
})
export class QueueModule {
  static register(
    queueName: QueuesEnum,
    clientName: string = 'QUEUE_CLIENT',
  ): DynamicModule {
    return {
      module: QueueModule,
      imports: [
        ClientsModule.register([
          {
            name: clientName,
            transport: Transport.RMQ,
            options: generateQueueOptions(queueName),
          },
        ]),
      ],
      providers: [QueueClient],
      exports: [QueueClient, ClientsModule],
    };
  }
}
