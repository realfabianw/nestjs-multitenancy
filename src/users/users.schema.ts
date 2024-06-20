import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { systemRoles } from '../roles/roles.schema';
import { relations } from 'drizzle-orm';
import { todosTable } from '../todos/todos.schema';
import {
  SelectTenantMembership,
  tenantMemberships,
} from '../tenants/tenants-membershipts.schema';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  role: systemRoles('role').notNull().default('CUSTOMER'),
});

export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todosTable),
  tenantMemberships: many(tenantMemberships),
}));

export type SelectUser = typeof users.$inferSelect;
export type User = SelectUser & {
  tenantMemberships: SelectTenantMembership[];
};
