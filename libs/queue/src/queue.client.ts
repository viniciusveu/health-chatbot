import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
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
      Logger.log(`📤 Emitting pattern "${pattern}"`);
      Logger.log('📦 Payload:', JSON.stringify(data));

      await this.client.emit(pattern, data);
    } catch (error) {
      Logger.error('❌ Error emitting event to queue:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
