import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { LoggingInterceptor } from './logging.interceptor';
import { LoggingRepository } from './logging.repository';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [LoggingService, LoggingInterceptor, LoggingRepository],
  exports: [LoggingService, LoggingInterceptor, LoggingRepository],
})
export class LoggingModule {}
