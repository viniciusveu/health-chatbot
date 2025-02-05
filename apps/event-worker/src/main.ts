import { NestFactory } from '@nestjs/core';
import { EventWorkerModule } from './event-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(EventWorkerModule);
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
