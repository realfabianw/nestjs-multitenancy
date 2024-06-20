import { SystemRole, TenantRole } from '../roles/roles.schema';
import { Permission } from './entities/permissions.enum';

export interface RolePermission<T> {
  role: T;
  permissions: Permission[];
}

export const systemPermissions: RolePermission<SystemRole>[] = [
  {
    role: 'ADMIN',
    permissions: [Permission.manage_all, Permission.tenant_manage_all],
  },
  {
    role: 'CUSTOMER',
    permissions: [Permission.manage_self],
  },
];

export const tenantPermissions: RolePermission<TenantRole>[] = [
  {
    role: 'ADMIN',
    permissions: [Permission.tenant_manage_self],
  },
  {
    role: 'MEMBER',
    permissions: [Permission.tenant_read_self, Permission.tenant_update_self],
  },
];

export function getPermissionsFromSystemRole(role: SystemRole): Permission[] {
  const permissions = systemPermissions.find(
    (rolePermissions) => rolePermissions.role === role,
  )?.permissions;
  return addInheritedPermissions(permissions);
}

export function getPermissionsFromTenantRole(role: TenantRole): Permission[] {
  const permissions = tenantPermissions.find(
    (rolePermissions) => rolePermissions.role === role,
  )?.permissions;
  return addInheritedPermissions(permissions);
}

function addInheritedPermissions(permissions: Permission[]): Permission[] {
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
