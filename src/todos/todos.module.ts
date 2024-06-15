import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TenantProvider } from '../auth/tenant.provider';

@Module({
  controllers: [TodosController],
  providers: [TodosService, TenantProvider],
})
export class TodosModule {}
