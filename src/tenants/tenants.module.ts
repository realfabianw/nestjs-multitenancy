import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, RequestMetadataProvider],
})
export class TenantsModule {}
