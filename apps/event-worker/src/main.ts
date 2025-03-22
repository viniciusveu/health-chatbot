import { NestFactory } from '@nestjs/core';
import { EventWorkerModule } from './event-worker.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(EventWorkerModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.EVENT_WORKER_PORT ?? 3000);
}
bootstrap().catch((error) => console.log(error));
