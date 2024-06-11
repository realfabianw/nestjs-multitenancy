import { SetMetadata } from '@nestjs/common';
import { TenantUserRole, UserRole } from '../../drizzle/schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const TENANT_ROLES_KEY = 'tenant_roles';
export const TenantRoles = (...roles: TenantUserRole[]) =>
  SetMetadata(TENANT_ROLES_KEY, roles);
