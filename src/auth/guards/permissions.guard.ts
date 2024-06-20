import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../entities/permissions.enum';
import {
  getPermissionsFromSystemRole,
  getPermissionsFromTenantRole,
} from '../role-permissions';
import { User } from '../../users/users.schema';
import { TenantRole } from '../../roles/roles.schema';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions: Permission[] = this.reflector.getAllAndOverride<
      Permission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      // Authenticate the request if no permission is required.
      return true;
    }

    const user: User = context.switchToHttp().getRequest().user;

    this.logger.debug(
      'Required permissions: ' + requiredPermissions.join(', '),
    );

    const userPermissions =
      this.getUniquePermissionsFromRequestingUser(context);

    this.logger.debug('User permissions: ' + userPermissions.join(', '));

    const userHasRequiredPermissions = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!userHasRequiredPermissions) {
      this.logger.debug('User does not have required permissions.');
      return false;
    }

    if (this.permissionsContainSelfScope(requiredPermissions)) {
      this.logger.debug("This resource requires a 'self' permission.");

      const requestUserId: number = Number.parseInt(
        context.switchToHttp().getRequest().params.id,
      );

      if (requestUserId && requestUserId != user.id) {
        this.logger.debug(
          'Requesting user id does not match the user id in the request.',
        );
        return false;
      }
    }

    return true;
  }

  private permissionsContainSelfScope(permissions: Permission[]): boolean {
    return permissions.some((permission) =>
      permission.toString().includes('self'),
    );
  }

  private getUniquePermissionsFromRequestingUser(
    context: ExecutionContext,
  ): Permission[] {
    const tenantId: number = Number.parseInt(
      context.switchToHttp().getRequest().headers['x-tenant-id'],
    );
    const user: User = context.switchToHttp().getRequest().user;
    this.logger.debug('System Role: ' + user.role);
    const permissions: Permission[] = getPermissionsFromSystemRole(user.role);

    try {
      const tenantRole: TenantRole = user.tenantMemberships.filter(
        (tm) => tm.tenantId === tenantId,
      )[0].role;
      this.logger.debug('Tenant Role: ' + tenantRole);
      permissions.push(...getPermissionsFromTenantRole(tenantRole));
    } catch (err) {}

    return [...new Set(permissions)];
  }
}
