import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from '../../drizzle/schema';
import { TENANT_ROLES_KEY } from '../decorators/authorization.decorator';

@Injectable()
export class TenantRolesGuard implements CanActivate {
  private readonly logger = new Logger(TenantRolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      TENANT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const tenantId: number = Number.parseInt(
      context.switchToHttp().getRequest().headers['x-tenant-id'],
    );

    this.logger.log(`Tenant ID: ${tenantId}`);

    const user: User = context.switchToHttp().getRequest().user;

    this.logger.log(`User: ${JSON.stringify(user)}`);

    const tenantUsers = user.tenantUsers.filter(
      (tenantUser) => tenantUser.tenantId == tenantId,
    );

    this.logger.log(`Tenant Users: ${JSON.stringify(tenantUsers)}`);

    const userRoles = user.tenantUsers
      .filter((tenantUser) => tenantUser.tenantId === tenantId)
      .map((tenantUser) => tenantUser.roles.map((role) => role.role))
      .flat();

    this.logger.log(`User Tenant Roles: ${userRoles}`);

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
