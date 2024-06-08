import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthenticationResponse } from './entities/dto/authentication-response.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import LoginDto from './entities/dto/login.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import UserResponseDto from '../users/dto/user-response.dto';
import { Public } from './auth.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { User } from '../drizzle/schema';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() userDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(userDto);
    return {
      id: user.id,
      email: user.email,
    };
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
  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthenticationResponse> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.createAuthenticationResponse(response, user);
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user: User = request.user as User;
    return this.createAuthenticationResponse(response, user);
  }

  @Public()
  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(this.configService.get<string>('ACCESS_TOKEN_NAME'));
    response.clearCookie(this.configService.get<string>('REFRESH_TOKEN_NAME'));
    response.status(200).send();
  }

  private async createAuthenticationResponse(
    response: Response,
    user: User,
  ): Promise<AuthenticationResponse> {
    const accessToken = await this.authService.createAccessToken(user);
    const refreshToken = await this.authService.createRefreshToken(user);

    response.status(200);

    this.addCookie(
      response,
      this.configService.get<string>('ACCESS_TOKEN_NAME'),
      accessToken,
      this.configService.get<string>('ACCESS_TOKEN_JWT_EXPIRES_IN'),
    );

    this.addCookie(
      response,
      this.configService.get<string>('REFRESH_TOKEN_NAME'),
      refreshToken,
      this.configService.get<string>('REFRESH_TOKEN_JWT_EXPIRES_IN'),
    );

    return {
      user: { id: user.id, email: user.email },
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  private async addCookie(
    response: Response,
    name: string,
    token: string,
    expiration: string,
  ) {
    response.cookie(name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: ms(expiration),
      sameSite: 'strict',
    });
  }
}
