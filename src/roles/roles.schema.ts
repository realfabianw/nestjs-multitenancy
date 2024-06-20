import { pgEnum } from 'drizzle-orm/pg-core';
import { users } from '../users/users.schema';
import { tenantMemberships } from '../tenants/tenants-membershipts.schema';

export const systemRoles = pgEnum('user_role', ['ADMIN', 'CUSTOMER']);
export type SystemRole = typeof users.$inferSelect.role;

export const tenantRoles = pgEnum('tenant_role', ['ADMIN', 'MEMBER']);
export type TenantRole = typeof tenantMemberships.$inferSelect.role;
