import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EncryptionService } from '../encryption/encryption.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './entities/jwt-payload';
import { User } from '../drizzle/schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly encryptionService: EncryptionService,
    private readonly jwtService: JwtService,
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

  async createToken(user: User, expiresIn: string): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
    };
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn,
    });
  }
}
