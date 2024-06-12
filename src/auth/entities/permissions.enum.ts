export enum Permission {
  manage_self = 'manage:self',
  create_self = 'create:self',
  read_self = 'read:self',
  update_self = 'update:self',
  delete_self = 'delete:self',

  manage_all = 'manage:all',
  create_all = 'create:all',
  read_all = 'read:all',
  update_all = 'update:all',
  delete_all = 'delete:all',

  tenant_manage_self = 'tenant:manage:self',
  tenant_create_self = 'tenant:create:self',
  tenant_read_self = 'tenant:read:self',
  tenant_update_self = 'tenant:update:self',
  tenant_delete_self = 'tenant:delete:self',

  tenant_manage_all = 'tenant:manage:all',
  tenant_create_all = 'tenant:create:all',
  tenant_read_all = 'tenant:read:all',
  tenant_update_all = 'tenant:update:all',
  tenant_delete_all = 'tenant:delete:all',
}
