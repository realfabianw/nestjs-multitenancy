import { systemRoles, tenantRoles } from '../roles/roles.schema';
import {
  tenantMemberships,
  tenantMembershipRelations,
} from '../tenants/tenants-membershipts.schema';
import { tenants, tenantsRelations } from '../tenants/tenants.schema';
import {
  todoStatusEnum,
  todosTable,
  todosRelations,
} from '../todos/todos.schema';
import { users, usersRelations } from '../users/users.schema';

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
