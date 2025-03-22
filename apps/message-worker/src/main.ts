import { NestFactory } from '@nestjs/core';
import { MessageWorkerModule } from './message-worker.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QueuesEnum } from '@app/shared/enums';

async function bootstrap() {
  const app = await NestFactory.create(MessageWorkerModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
      queue: QueuesEnum.MESSAGE_WORKER,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = process.env.MESSAGE_WORKER_PORT || 3000;
  await app.listen(port);

  console.log(`MessageWorker HTTP server running on port ${port}`);
}
bootstrap().catch(error => console.log(error));
