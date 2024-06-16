import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { takeUniqueOrThrow } from '../drizzle/extensions';
import { and, eq, isNull } from 'drizzle-orm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { SelectTodo } from '../drizzle/schema';

@Injectable()
export class TodosService {
  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(
    createTodoDto: CreateTodoDto,
    userId: number,
    tenantId?: number,
  ): Promise<SelectTodo> {
    if (tenantId) {
      return await this.db
        .insert(schema.todosTable)
        .values({
          userId: userId,
          title: createTodoDto.title,
          description: createTodoDto.description,
          tenantId: tenantId,
        })
        .returning()
        .then(takeUniqueOrThrow);
    } else {
      return await this.db
        .insert(schema.todosTable)
        .values({
          userId: userId,
          title: createTodoDto.title,
          description: createTodoDto.description,
        })
        .returning()
        .then(takeUniqueOrThrow);
    }
  }

  async findAll(userId: number, tenantId?: number): Promise<SelectTodo[]> {
    if (tenantId) {
      return await this.db.query.todosTable.findMany({
        where: and(
          eq(schema.todosTable.userId, userId),
          eq(schema.todosTable.tenantId, tenantId),
        ),
      });
    } else {
      return await this.db.query.todosTable.findMany({
        where: and(
          eq(schema.todosTable.userId, userId),
          isNull(schema.todosTable.tenantId),
        ),
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
        where: and(
          eq(schema.todosTable.id, id),
          isNull(schema.todosTable.tenantId),
        ),
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
        .where(
          and(eq(schema.todosTable.id, id), isNull(schema.todosTable.tenantId)),
        )
        .returning()
        .then(takeUniqueOrThrow);
    }
  }

  async remove(id: number, tenantId?: number): Promise<SelectTodo> {
    if (tenantId) {
      return await this.db
        .delete(schema.todosTable)
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
        .delete(schema.todosTable)
        .where(
          and(eq(schema.todosTable.id, id), isNull(schema.todosTable.tenantId)),
        )
        .returning()
        .then(takeUniqueOrThrow);
    }
  }
}
