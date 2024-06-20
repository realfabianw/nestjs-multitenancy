import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { takeUniqueOrThrow } from '../drizzle/extensions';
import { and, eq, isNull } from 'drizzle-orm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { drizzleSchema } from '../drizzle/schema';
import { SelectTodo } from './todos.schema';

@Injectable()
export class TodosService {
  constructor(
    @Inject('DB_PROD')
    private readonly db: PostgresJsDatabase<typeof drizzleSchema>,
  ) {}

  async create(
    createTodoDto: CreateTodoDto,
    userId: number,
    tenantId?: number,
  ): Promise<SelectTodo> {
    if (tenantId) {
      return await this.db
        .insert(drizzleSchema.todosTable)
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
        .insert(drizzleSchema.todosTable)
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
          eq(drizzleSchema.todosTable.userId, userId),
          eq(drizzleSchema.todosTable.tenantId, tenantId),
        ),
      });
    } else {
      return await this.db.query.todosTable.findMany({
        where: and(
          eq(drizzleSchema.todosTable.userId, userId),
          isNull(drizzleSchema.todosTable.tenantId),
        ),
      });
    }
  }

  async findOne(id: number, tenantId?: number): Promise<SelectTodo> {
    if (tenantId) {
      return await this.db.query.todosTable.findFirst({
        where: and(
          eq(drizzleSchema.todosTable.id, id),
          eq(drizzleSchema.todosTable.tenantId, tenantId),
        ),
      });
    } else {
      return await this.db.query.todosTable.findFirst({
        where: and(
          eq(drizzleSchema.todosTable.id, id),
          isNull(drizzleSchema.todosTable.tenantId),
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
        .update(drizzleSchema.todosTable)
        .set(updateTodoDto)
        .where(
          and(
            eq(drizzleSchema.todosTable.id, id),
            eq(drizzleSchema.todosTable.tenantId, tenantId),
          ),
        )
        .returning()
        .then(takeUniqueOrThrow);
    } else {
      return await this.db
        .update(drizzleSchema.todosTable)
        .set(updateTodoDto)
        .where(
          and(
            eq(drizzleSchema.todosTable.id, id),
            isNull(drizzleSchema.todosTable.tenantId),
          ),
        )
        .returning()
        .then(takeUniqueOrThrow);
    }
  }

  async remove(id: number, tenantId?: number): Promise<SelectTodo> {
    if (tenantId) {
      return await this.db
        .delete(drizzleSchema.todosTable)
        .where(
          and(
            eq(drizzleSchema.todosTable.id, id),
            eq(drizzleSchema.todosTable.tenantId, tenantId),
          ),
        )
        .returning()
        .then(takeUniqueOrThrow);
    } else {
      return await this.db
        .delete(drizzleSchema.todosTable)
        .where(
          and(
            eq(drizzleSchema.todosTable.id, id),
            isNull(drizzleSchema.todosTable.tenantId),
          ),
        )
        .returning()
        .then(takeUniqueOrThrow);
    }
  }
}
