import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EncryptionModule } from '../encryption/encryption.module';
import { TenantProvider } from '../auth/tenant.provider';

@Module({
  imports: [EncryptionModule],
  controllers: [UsersController],
  providers: [UsersService, TenantProvider],
  exports: [UsersService],
})
export class UsersModule {}
