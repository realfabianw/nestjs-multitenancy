import { UserRole } from '../drizzle/schema';
import { Permission } from './entities/permissions.enum';

export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}

export const rolePermissions: RolePermission[] = [
  {
    role: 'SYSTEM_ADMIN',
    permissions: [Permission.manage_all, Permission.tenant_manage_all],
  },
  {
    role: 'SYSTEM_USER',
    permissions: [
      Permission.read_self,
      Permission.update_self,
      Permission.delete_self,
    ],
  },
  {
    role: 'TENANT_ADMIN',
    permissions: [Permission.tenant_manage_all],
  },
  {
    role: 'TENANT_USER',
    permissions: [
      Permission.tenant_read_self,
      Permission.tenant_update_self,
      Permission.tenant_delete_self,
    ],
  },
];

export function getUniquePermissionsFromRole(role: UserRole): Permission[] {
  const permissions: Permission[] = rolePermissions.find(
    (rolePermission) => rolePermission.role === role,
  )?.permissions;

  // Adding manage permissions.

  if (permissions.includes(Permission.manage_self)) {
    permissions.push(
      ...[
        Permission.create_self,
        Permission.read_self,
        Permission.update_self,
        Permission.delete_self,
      ],
    );
  }

  if (permissions.includes(Permission.manage_all)) {
    permissions.push(
      ...[
        Permission.create_all,
        Permission.read_all,
        Permission.update_all,
        Permission.delete_all,
      ],
    );
  }

  if (permissions.includes(Permission.tenant_manage_self)) {
    permissions.push(
      ...[
        Permission.tenant_create_self,
        Permission.tenant_read_self,
        Permission.tenant_update_self,
        Permission.tenant_delete_self,
      ],
    );
  }

  if (permissions.includes(Permission.tenant_manage_all)) {
    permissions.push(
      ...[
        Permission.tenant_create_all,
        Permission.tenant_read_all,
        Permission.tenant_update_all,
        Permission.tenant_delete_all,
      ],
    );
  }

  // Adding self permissions, if all permissions are present.
  if (permissions.includes(Permission.create_all)) {
    permissions.push(Permission.create_self);
  }
  if (permissions.includes(Permission.read_all)) {
    permissions.push(Permission.read_self);
  }
  if (permissions.includes(Permission.update_all)) {
    permissions.push(Permission.update_self);
  }
  if (permissions.includes(Permission.delete_all)) {
    permissions.push(Permission.delete_self);
  }
  if (permissions.includes(Permission.tenant_create_all)) {
    permissions.push(Permission.tenant_create_self);
  }
  if (permissions.includes(Permission.tenant_read_all)) {
    permissions.push(Permission.tenant_read_self);
  }
  if (permissions.includes(Permission.tenant_update_all)) {
    permissions.push(Permission.tenant_update_self);
  }
  if (permissions.includes(Permission.tenant_delete_all)) {
    permissions.push(Permission.tenant_delete_self);
  }

  return [...new Set(permissions)];
}
