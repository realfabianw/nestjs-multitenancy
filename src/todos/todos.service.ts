import { Inject, Injectable, Scope } from '@nestjs/common';
import { CreateTodoDto } from './entities/dto/create-todo.dto';
import { UpdateTodoDto } from './entities/dto/update-todo.dto';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { takeUniqueOrThrow } from '../drizzle/extensions';
import { REQUEST } from '@nestjs/core';
import { eq } from 'drizzle-orm';

@Injectable({ scope: Scope.REQUEST })
export class TodosService {
  private readonly user: schema.User = this.request['user'];

  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<schema.Todo> {
    return await this.db
      .insert(schema.todosTable)
      .values({
        userId: this.user.id,
        title: createTodoDto.title,
        description: createTodoDto.description,
      })
      .returning()
      .then(takeUniqueOrThrow);
  }

  async findAll(): Promise<schema.Todo[]> {
    return await this.db.select().from(schema.todosTable);
  }

  async findOne(id: number): Promise<schema.Todo> {
    return await this.db
      .select()
      .from(schema.todosTable)
      .where(eq(schema.usersTable.id, id))
      .then(takeUniqueOrThrow);
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<schema.Todo> {
    return await this.db
      .update(schema.todosTable)
      .set(updateTodoDto)
      .where(eq(schema.todosTable.id, id))
      .returning()
      .then(takeUniqueOrThrow);
  }

  async remove(id: number): Promise<schema.Todo> {
    return await this.db
      .delete(schema.todosTable)
      .where(eq(schema.todosTable.id, id))
      .returning()
      .then(takeUniqueOrThrow);
  }
}
