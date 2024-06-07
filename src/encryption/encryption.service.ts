import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}

  async hash(plain: string): Promise<string> {
    return hash(
      plain,
      parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '10')),
    );
  }

  async compare(plain: string, encrypted: string): Promise<boolean> {
    return compare(plain, encrypted);
  }
}
