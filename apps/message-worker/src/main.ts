import { NestFactory } from '@nestjs/core';
import { MessageWorkerModule } from './message-worker.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QueuesEnum } from '@app/shared/enums';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MessageWorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
        queue: QueuesEnum.MESSAGE_WORKER,
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await app.init();
}
bootstrap();
