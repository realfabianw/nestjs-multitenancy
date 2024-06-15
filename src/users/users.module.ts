import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EncryptionModule } from '../encryption/encryption.module';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';

@Module({
  imports: [EncryptionModule],
  controllers: [UsersController],
  providers: [UsersService, RequestMetadataProvider],
  exports: [UsersService],
})
export class UsersModule {}
