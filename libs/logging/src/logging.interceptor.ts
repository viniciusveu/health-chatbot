import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType();

    Logger.log('==========================\n');
    
    if (type === 'http') {
      const req = context.switchToHttp().getRequest();
      Logger.log(`🌐 HTTP Request: ${req.method} ${req.url}`);
      Logger.log('📦 Body:', req.body);
    }

    if (type === 'rpc') {
      const rpcContext = context.switchToRpc();
      const data = rpcContext.getData();
      const pattern = rpcContext.getContext().getPattern();

      Logger.log(`📥 RabbitMQ Message on pattern: ${pattern}`);
      Logger.log('📦 Payload:', data);
    }

    return next.handle().pipe(
      tap((res) => Logger.log('✅ Response:', res)),
    );
  }
}
