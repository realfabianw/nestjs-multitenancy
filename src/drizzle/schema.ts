import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, serial, text } from 'drizzle-orm/pg-core';

// Roles for Users & Tenants

export const systemRoles = pgEnum('user_role', ['ADMIN', 'CUSTOMER']);
export type SystemRole = typeof users.$inferSelect.role;

export const tenantRoles = pgEnum('tenant_role', ['ADMIN', 'MEMBER']);
export type TenantRole = typeof tenantMemberships.$inferSelect.role;
// Users

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

// Tenants

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

// Tenant Memberships

export const tenantMemberships = pgTable('tenants_users', {
  tenantId: integer('tenant_id')
    .references(() => tenants.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  role: tenantRoles('role').notNull().default('MEMBER'),
});

export const tenantMembershipRelations = relations(
  tenantMemberships,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenantMemberships.tenantId],
      references: [tenants.id],
    }),
    user: one(users, {
      fields: [tenantMemberships.userId],
      references: [users.id],
    }),
  }),
);

export type SelectTenantMembership = typeof tenantMemberships.$inferSelect;

// Todos

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
  tenantId: integer('tenant_id').references(() => tenants.id, {
    onDelete: 'cascade',
  }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: todoStatusEnum('status').notNull().default('OPEN'),
});

export const todosRelations = relations(todosTable, ({ one }) => ({
  tenant: one(tenants),
  user: one(users),
}));

export type SelectTodo = typeof todosTable.$inferSelect;

export const drizzleSchema = {
  systemRoles,
  tenantRoles,
  users,
  usersRelations,
  tenants,
  tenantsRelations,
  tenantMemberships,
  tenantMembershipRelations,
  todoStatusEnum,
  todosTable,
  todosRelations,
};
