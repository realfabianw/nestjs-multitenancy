import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { ApiTags } from '@nestjs/swagger';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoDto } from './dto/todo.dto';
import { RequiresPermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/entities/permissions.enum';
import { TenantProvider } from '../auth/tenant.provider';

@ApiTags('Todos')
@Controller('todos')
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
    private readonly tenantProvider: TenantProvider,
  ) {}

  @RequiresPermissions(Permission.create_self, Permission.tenant_create_self)
  @Post()
  async create(@Body() createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const todo = await this.todosService.create(
      createTodoDto,
      this.tenantProvider.isTenantRequest && this.tenantProvider.tenantId,
    );
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
    };
  }

  @RequiresPermissions(Permission.read_all)
  @Get()
  async findAll(): Promise<TodoDto[]> {
    const todos = await this.todosService.findAll(
      this.tenantProvider.isTenantRequest && this.tenantProvider.tenantId,
    );
    return todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      description: todo.description,
    }));
  }

  @RequiresPermissions(Permission.read_self)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TodoDto> {
    const todo = await this.todosService.findOne(
      +id,
      this.tenantProvider.isTenantRequest && this.tenantProvider.tenantId,
    );
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
    };
  }

  @RequiresPermissions(Permission.update_self)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<TodoDto> {
    const todo = await this.todosService.update(
      +id,
      updateTodoDto,
      this.tenantProvider.isTenantRequest && this.tenantProvider.tenantId,
    );
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
    };
  }

  @RequiresPermissions(Permission.delete_self)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.todosService.remove(
      +id,
      this.tenantProvider.isTenantRequest && this.tenantProvider.tenantId,
    );
  }
}
