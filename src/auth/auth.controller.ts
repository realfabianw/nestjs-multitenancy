import { Body, Controller, Post, Res } from '@nestjs/common';
import { CreateUserDto } from '../users/entities/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtResponse } from './entities/jwt-response.entity';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import LoginDto from './entities/dto/login.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() userDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(userDto);
  }

  @ApiResponse({
    status: 200,
    description:
      "The user has been successfully authenticated. The JWT token is returned in the response's body and set as a cookie in the response's headers.",
  })
  @ApiResponse({
    status: 401,
    description: 'The user could not be authenticated.',
  })
  @ApiResponse({
    status: 400,
    description: 'The request body is malformed.',
  })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<JwtResponse> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    const token = await this.authService.createToken(user);

    response.status(200);
    response.cookie(
      this.configService.get<string>('ACCESS_TOKEN_NAME'),
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: ms(
          this.configService.get<string>('ACCESS_TOKEN_JWT_EXPIRES_IN'),
        ),
        sameSite: 'strict',
      },
    );

    return { token };
  }
}
