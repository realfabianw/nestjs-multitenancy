import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
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
      this.tenantProvider.getTenantId(),
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
      this.tenantProvider.getTenantId(),
    );
    return todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      description: todo.description,
    }));
  }

  @RequiresPermissions(Permission.read_self)
  @Get(':todoId')
  async findOne(@Param('todoId') todoId: string): Promise<TodoDto> {
    const todo = await this.todosService.findOne(
      +todoId,
      this.tenantProvider.getTenantId(),
    );
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
    };
  }

  @RequiresPermissions(Permission.update_self)
  @Patch(':todoId')
  async update(
    @Param('todoId') todoId: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Res() res,
  ) {
    try {
      const todo = await this.todosService.update(
        +todoId,
        updateTodoDto,
        this.tenantProvider.getTenantId(),
      );
      res.status(200).send({
        id: todo.id,
        title: todo.title,
        description: todo.description,
      });
    } catch (err) {
      res.status(404).send();
    }
  }

  @RequiresPermissions(Permission.delete_self)
  @Delete(':todoId')
  async remove(@Param('todoId') todoId: string, @Res() res) {
    try {
      const todo = await this.todosService.remove(
        +todoId,
        this.tenantProvider.getTenantId(),
      );
      res.status(200).send({
        id: todo.id,
        title: todo.title,
        description: todo.description,
      });
    } catch (err) {
      res.status(404).send();
    }
  }
}
