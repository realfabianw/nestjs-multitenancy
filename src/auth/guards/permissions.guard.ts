import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from '../../drizzle/schema';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../entities/permissions.enum';
import { getUniquePermissionsFromRole } from '../role-permissions';

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

      if (requestUserId != user.id) {
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
    const roles = this.getUniqueRolesFromRequestingUser(user, tenantId);
    this.logger.debug('User roles: ' + roles.join(', '));
    return this.getUniquePermissionsFromRoles(roles);
  }

  getUniquePermissionsFromRoles(roles: UserRole[]): Permission[] {
    const permissions: Permission[] = [];
    for (const role of roles) {
      permissions.push(...getUniquePermissionsFromRole(role));
    }
    return [...new Set<Permission>(permissions)];
  }

  private getUniqueRolesFromRequestingUser(user: User, tenantId: number) {
    const roles: UserRole[] = user.roles.map((role) => role.role);
    roles.push(
      ...user.tenantUsers
        .filter((tenantUser) => tenantUser.tenantId === tenantId)
        .map((tenantUser) => tenantUser.roles.map((role) => role.role))
        .flat(),
    );
    return [...new Set(roles)];
  }
}
