import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { UsersModule } from '../users/users.module';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';

@Module({
  imports: [UsersModule],
  controllers: [RolesController],
  providers: [RolesService, RequestMetadataProvider],
})
export class RolesModule {}
