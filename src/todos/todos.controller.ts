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
import { RequestMetadataProvider } from '../auth/request-metadata.provider';

@ApiTags('Todos')
@Controller('todos')
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
    private readonly requestMetadata: RequestMetadataProvider,
  ) {}

  @RequiresPermissions(Permission.create_self, Permission.tenant_create_self)
  @Post()
  async create(@Body() createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const todo = await this.todosService.create(
      createTodoDto,
      this.requestMetadata.getRequestingUserId(),
      this.requestMetadata.getTenantId(),
    );
    return TodoDto.fromEntity(todo);
  }

  @RequiresPermissions(Permission.read_self)
  @Get()
  async findAll(): Promise<TodoDto[]> {
    const todos = await this.todosService.findAll(
      this.requestMetadata.getRequestingUserId(),
      this.requestMetadata.getTenantId(),
    );
    return todos.map((todo) => TodoDto.fromEntity(todo));
  }

  @RequiresPermissions(Permission.read_self)
  @Get(':todoId')
  async findOne(@Param('todoId') todoId: string): Promise<TodoDto> {
    const todo = await this.todosService.findOne(
      +todoId,
      this.requestMetadata.getTenantId(),
    );
    return TodoDto.fromEntity(todo);
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
        this.requestMetadata.getTenantId(),
      );
      res.status(200).send(TodoDto.fromEntity(todo));
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
        this.requestMetadata.getTenantId(),
      );
      res.status(200).send(TodoDto.fromEntity(todo));
    } catch (err) {
      res.status(404).send();
    }
  }
}
