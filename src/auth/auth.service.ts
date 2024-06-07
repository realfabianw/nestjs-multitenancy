import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EncryptionService } from '../encryption/encryption.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './entities/jwt-payload.entity';
import { JwtResponse } from './entities/jwt-response.entity';

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

    return null;
  }
  async createToken(user: User): Promise<JwtResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
