import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';

@Module({
  controllers: [TodosController],
  providers: [TodosService, RequestMetadataProvider],
})
export class TodosModule {}
