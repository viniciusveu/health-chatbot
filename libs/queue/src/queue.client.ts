import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class QueueClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('QUEUE_CLIENT') private readonly client: ClientProxy) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async emit(pattern: string, data: any): Promise<void> {
    try {
      await this.client.emit(pattern, data);
    } catch (error) {
      console.error('Error emitting event to RabbitMQ:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
