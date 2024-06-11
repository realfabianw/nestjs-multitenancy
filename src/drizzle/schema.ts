import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, serial, text } from 'drizzle-orm/pg-core';

// User Roles

export const userRolesEnum = pgEnum('user_role', ['ADMIN', 'USER']);

export const userRolesTable = pgTable('users_roles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  role: userRolesEnum('role').notNull().default('USER'),
});

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userRolesTable.userId],
    references: [usersTable.id],
  }),
}));

export type SelectUserRole = typeof userRolesTable.$inferSelect;
export type UserRole = typeof userRolesTable.$inferSelect.role; // Using this type as enum

// Users

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  roles: many(userRolesTable),
  todos: many(todosTable),
  tenantUsers: many(tenantUsersTable),
}));

export type SelectUser = typeof usersTable.$inferSelect;
export type User = SelectUser & {
  roles: SelectUserRole[];
  tenantUsers: TenantUserWithRoles[];
};

// Tenants

export const tenantsTable = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
});

export const tenantsRelations = relations(tenantsTable, ({ many }) => ({
  tenantUsers: many(tenantUsersTable),
}));

export type SelectTenant = typeof tenantsTable.$inferSelect;

// Tenant Users

export const tenantUsersTable = pgTable('tenants_users', {
  tenantUserId: serial('tenant_user_id').primaryKey(),
  tenantId: integer('tenant_id')
    .references(() => tenantsTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
});

export const tenantUsersRelations = relations(
  tenantUsersTable,
  ({ one, many }) => ({
    tenant: one(tenantsTable, {
      fields: [tenantUsersTable.tenantId],
      references: [tenantsTable.id],
    }),
    user: one(usersTable, {
      fields: [tenantUsersTable.userId],
      references: [usersTable.id],
    }),
    roles: many(tenantUserRolesTable),
  }),
);

export type SelectTenantUser = typeof tenantUsersTable.$inferSelect;
export type TenantUserWithRoles = SelectTenantUser & {
  roles: SelectTenantUserRole[];
};

// Tenant User Roles

export const tenantUserRolesEnum = pgEnum('tenant_user_role', [
  'ADMIN',
  'USER',
]);

export const tenantUserRolesTable = pgTable('tenants_user_roles', {
  tenantUserId: integer('tenant_user_id')
    .notNull()
    .references(() => tenantUsersTable.tenantUserId, { onDelete: 'cascade' }),
  role: tenantUserRolesEnum('role').notNull().default('USER'),
});

export const tenantUserRolesRelations = relations(
  tenantUserRolesTable,
  ({ one }) => ({
    tenantUser: one(tenantUsersTable, {
      fields: [tenantUserRolesTable.tenantUserId],
      references: [tenantUsersTable.tenantUserId],
    }),
  }),
);

export type SelectTenantUserRole = typeof tenantUserRolesTable.$inferSelect;
export type TenantUserRole = typeof tenantUserRolesTable.$inferSelect.role; // Using this type as enum

// Todos

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

export type SelectTodo = typeof todosTable.$inferSelect;
export type TodoStatus = typeof todosTable.$inferSelect.status; // Using this type as enum
