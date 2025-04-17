import { NestFactory } from '@nestjs/core';
import { ChatbotModule } from './chatbot.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QueuesEnum } from '@app/shared/enums';
import { generateQueueOptions } from '@app/shared/helpers';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ChatbotModule,
    {
      transport: Transport.RMQ,
      options: generateQueueOptions(QueuesEnum.CHATBOT),
    },
  );
  await app.listen();
}
bootstrap().catch((error) => console.log(error));
