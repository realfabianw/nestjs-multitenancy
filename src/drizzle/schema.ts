import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
} from 'drizzle-orm/pg-core';

export const userRolesEnum = pgEnum('user_roles', [
  'SYSTEM_ADMIN',
  'TENANT_ADMIN',
  'USER',
]);

export const userRolesTable = pgTable(
  'users_roles',
  {
    userId: integer('user_id')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    role: userRolesEnum('role').notNull().default('USER'),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.role] }),
    };
  },
);

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userRolesTable.userId],
    references: [usersTable.id],
  }),
}));

export type SelectUserRole = typeof userRolesTable.$inferSelect;
export type UserRole = typeof userRolesTable.$inferSelect.role; // Using this type as enum

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  roles: many(userRolesTable),
  todos: many(todosTable),
}));
export type SelectUser = typeof usersTable.$inferSelect;
export type User = SelectUser & { roles: SelectUserRole[] };

export const todoStatusEnum = pgEnum('todo_status', [
  'OPEN',
  'IN_PROGRESS',
  'DONE',
]);

export const todosTable = pgTable('todos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: todoStatusEnum('status').notNull().default('OPEN'),
});

export const todosRelations = relations(todosTable, ({ one }) => ({
  user: one(usersTable),
}));

export type Todo = typeof todosTable.$inferSelect;
export type TodoStatus = typeof todosTable.$inferSelect.status; // Using this type as enum
