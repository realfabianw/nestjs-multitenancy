import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { takeUniqueOrThrow } from '../drizzle/extensions';
import { REQUEST } from '@nestjs/core';
import { and, eq } from 'drizzle-orm';
import { Request } from 'express';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { SelectTodo, User } from '../drizzle/schema';

@Injectable({ scope: Scope.REQUEST })
export class TodosService {
  private readonly logger = new Logger(TodosService.name);

  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(
    createTodoDto: CreateTodoDto,
    tenantId?: number,
  ): Promise<SelectTodo> {
    const user = this.request.user as User;

    return await this.db
      .insert(schema.todosTable)
      .values({
        userId: user.id,
        title: createTodoDto.title,
        description: createTodoDto.description,
        tenantId: tenantId,
      })
      .returning()
      .then(takeUniqueOrThrow);
  }

  async findAll(tenantId?: number): Promise<SelectTodo[]> {
    const user = this.request.user as User;
    if (tenantId) {
      return await this.db.query.todosTable.findMany({
        where: and(
          eq(schema.todosTable.userId, user.id),
          eq(schema.todosTable.tenantId, tenantId),
        ),
      });
    } else {
      return await this.db.query.todosTable.findMany({
        where: eq(schema.todosTable.userId, user.id),
      });
    }
  }

  async findOne(id: number, tenantId?: number): Promise<SelectTodo> {
    if (tenantId) {
      return await this.db.query.todosTable.findFirst({
        where: and(
          eq(schema.todosTable.id, id),
          eq(schema.todosTable.tenantId, tenantId),
        ),
      });
    } else {
      return await this.db.query.todosTable.findFirst({
        where: eq(schema.todosTable.id, id),
      });
    }
  }

  async update(
    id: number,
    updateTodoDto: UpdateTodoDto,
    tenantId?: number,
  ): Promise<SelectTodo> {
    if (tenantId) {
      return await this.db
        .update(schema.todosTable)
        .set(updateTodoDto)
        .where(
          and(
            eq(schema.todosTable.id, id),
            eq(schema.todosTable.tenantId, tenantId),
          ),
        )
        .returning()
        .then(takeUniqueOrThrow);
    } else {
      return await this.db
        .update(schema.todosTable)
        .set(updateTodoDto)
        .where(eq(schema.todosTable.id, id))
        .returning()
        .then(takeUniqueOrThrow);
    }
  }

  async remove(id: number, tenantId?: number) {
    if (tenantId) {
      await this.db
        .delete(schema.todosTable)
        .where(
          and(
            eq(schema.todosTable.id, id),
            eq(schema.todosTable.tenantId, tenantId),
          ),
        );
    } else {
      await this.db
        .delete(schema.todosTable)
        .where(eq(schema.todosTable.id, id));
    }
  }
}
