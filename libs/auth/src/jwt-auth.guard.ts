import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request as ExpressRequest } from 'express';

interface Request extends ExpressRequest {
  user: any;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) throw new UnauthorizedException('Token não fornecido');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token malformado');

    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      return true;
    } catch (err) {
      Logger.error(err);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
