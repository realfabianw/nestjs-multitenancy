import { pgEnum, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('email').notNull(),
});

export type User = typeof usersTable.$inferSelect;
// export type InsertUser = typeof usersTable.$inferInsert;

export const todoStatusEnum = pgEnum('todo_status', [
  'OPEN',
  'IN_PROGRESS',
  'DONE',
]);

export enum TodoStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export const todosTable = pgTable('todos', {
  id: serial('id').primaryKey(),
  userId: serial('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: todoStatusEnum('status').notNull().default('OPEN'),
});

export type Todo = typeof todosTable.$inferSelect;
// export type InsertTodo = typeof todosTable.$inferInsert;
