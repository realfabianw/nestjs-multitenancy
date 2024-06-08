import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { CreateUserDto } from '../users/entities/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtResponse } from './entities/jwt-response.entity';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import LoginDto from './entities/dto/login.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) response,
  ): Promise<JwtResponse> {
    const user = await this.usersService.create(userDto);
    const token = await this.authService.createToken(user);

    response.cookie(
      this.configService.get<string>('ACCESS_TOKEN_NAME'),
      token.token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: ms(
          this.configService.get<string>('ACCESS_TOKEN_JWT_EXPIRES_IN'),
        ),
        sameSite: 'strict',
      },
    );

    return token;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() request,
    @Res({ passthrough: true }) response,
  ): Promise<JwtResponse> {
    const token = await this.authService.createToken(request.user);

    response.cookie(
      this.configService.get<string>('ACCESS_TOKEN_NAME'),
      token.token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: ms(
          this.configService.get<string>('ACCESS_TOKEN_JWT_EXPIRES_IN'),
        ),
        sameSite: 'strict',
      },
    );

    return token;
  }
}
