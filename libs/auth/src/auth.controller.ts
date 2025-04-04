import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { userId: string; name: string }) {
    
    const token = this.authService.generateToken({
      sub: body.userId,
      name: body.name,
    });

    return { access_token: token };
  }
}
