import { UserRole } from '../../drizzle/schema';

export class UpdateRoleDto {
  roles: UserRole[];
}
