import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { takeUniqueOrThrow } from '../drizzle/extensions';
import { REQUEST } from '@nestjs/core';
import { eq } from 'drizzle-orm';
import { Request } from 'express';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable({ scope: Scope.REQUEST })
export class TodosService {
  private readonly logger = new Logger(TodosService.name);

  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<schema.Todo> {
    const user = this.getUser();
    return await this.db
      .insert(schema.todosTable)
      .values({
        userId: user.id,
        title: createTodoDto.title,
        description: createTodoDto.description,
      })
      .returning()
      .then(takeUniqueOrThrow);
  }

  async findAll(): Promise<schema.Todo[]> {
    const user = this.getUser();
    return await this.db.query.todosTable.findMany({
      where: eq(schema.todosTable.userId, user.id),
    });
  }

  async findOne(id: number): Promise<schema.Todo> {
    return await this.db
      .select()
      .from(schema.todosTable)
      .where(eq(schema.todosTable.id, id))
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

  private getUser(): schema.User {
    return this.request.user as schema.User;
  }
}
