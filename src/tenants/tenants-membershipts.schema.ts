import { relations } from 'drizzle-orm';
import { integer, pgTable } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.schema';
import { users } from '../users/users.schema';
import { tenantRoles } from '../roles/roles.schema';

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
