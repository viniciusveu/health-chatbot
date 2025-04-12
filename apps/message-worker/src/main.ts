import { NestFactory } from '@nestjs/core';
import { MessageWorkerModule } from './message-worker.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QueuesEnum } from '@app/shared/enums';
import { generateQueueOptions } from '@app/shared/helpers';
import { LoggingInterceptor } from '@app/logging/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(MessageWorkerModule);
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: generateQueueOptions(QueuesEnum.MESSAGE_WORKER),
  });

  await app.startAllMicroservices();

  const port = process.env.MESSAGE_WORKER_PORT || 3000;
  await app.listen(port);

  console.log(`MessageWorker HTTP server running on port ${port}`);
}
bootstrap().catch((error) => console.log(error));
