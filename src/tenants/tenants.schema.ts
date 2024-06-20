import { relations } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { tenantMemberships } from './tenants-membershipts.schema';
import { todosTable } from '../todos/todos.schema';

export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
});

export const tenantsRelations = relations(tenants, ({ many }) => ({
  memberships: many(tenantMemberships),
  todos: many(todosTable),
}));

export type SelectTenant = typeof tenants.$inferSelect;
