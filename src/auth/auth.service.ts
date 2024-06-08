import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EncryptionService } from '../encryption/encryption.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessTokenPayload } from './entities/jwt-access-token-payload.entity';
import { User } from '../drizzle/schema';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshTokenPayload } from './entities/jwt-refresh-token-payload.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly encryptionService: EncryptionService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.usersService.findOneByEmail(email);
    if (
      user !== undefined &&
      (await this.encryptionService.compare(password, user.password))
    ) {
      return user;
    }

    throw new UnauthorizedException();
  }

  async createAccessToken(user: User): Promise<string> {
    const payload: JwtAccessTokenPayload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_JWT_EXPIRES_IN'),
    });
  }

  async createRefreshToken(user: User): Promise<string> {
    const payload: JwtRefreshTokenPayload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_JWT_EXPIRES_IN'),
    });
  }
}
