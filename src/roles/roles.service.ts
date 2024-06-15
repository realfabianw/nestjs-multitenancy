import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../drizzle/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly usersService: UsersService,
    private readonly requestMetaData: RequestMetadataProvider,
  ) {}

  async update(
    userId: number,
    updateRoleDto: UpdateRoleDto,
    tenantId?: number,
  ): Promise<User> {
    const existingRoles: UserRole[] = await this.checkRoles(userId, tenantId);

    const newRoles: UserRole[] = updateRoleDto.roles.filter(
      (role) => !existingRoles.includes(role),
    );

    if (
      !tenantId &&
      newRoles.some((role) => role.toString().includes('TENANT'))
    ) {
      throw new Error(
        'Cannot assign TENANT_ADMIN or TENANT_USER role to system user.',
      );
    }

    if (
      tenantId &&
      newRoles.some((role) => role.toString().includes('SYSTEM'))
    ) {
      throw new Error(
        'Cannot assign SYSTEM_ADMIN or SYSTEM_USER role to tenant user.',
      );
    }

    if (newRoles.includes('SYSTEM_ADMIN')) {
      if (!this.requestMetaData.isRequestingUserSystemAdmin()) {
        throw new UnauthorizedException(
          'Only system admins can assign SYSTEM_ADMIN role.',
        );
      }
    }

    if (newRoles.includes('TENANT_ADMIN')) {
      if (!this.requestMetaData.isRequestingUserTenantAdmin()) {
        throw new UnauthorizedException(
          'Only tenant admins can assign TENANT_ADMIN role.',
        );
      }
    }

    const rolesToRemove = existingRoles.filter(
      (role) => !updateRoleDto.roles.includes(role),
    );

    this.logger.log(`Adding roles: ${newRoles}`);
    this.logger.log(`Removing roles: ${rolesToRemove}`);

    if (newRoles.length) {
      await this.addRoles(userId, newRoles, tenantId);
    }

    if (rolesToRemove.length) {
      await this.removeRoles(userId, rolesToRemove, tenantId);
    }

    return await this.usersService.findOne(userId, tenantId);
  }

  private async checkRoles(
    userId: number,
    tenantId?: number,
  ): Promise<UserRole[]> {
    if (tenantId) {
      const tenantUser = await this.db.query.tenantUsersTable.findFirst({
        where: and(
          eq(schema.tenantUsersTable.tenantId, tenantId),
          eq(schema.tenantUsersTable.userId, userId),
        ),
      });

      const tenantUserRoles = await this.db.query.tenantUserRolesTable.findMany(
        {
          where: eq(
            schema.tenantUserRolesTable.tenantUserId,
            tenantUser.tenantUserId,
          ),
        },
      );

      return tenantUserRoles.map((tenantUserRole) => tenantUserRole.role);
    } else {
      const userRoles = await this.db.query.userRolesTable.findMany({
        where: eq(schema.userRolesTable.userId, userId),
      });

      return userRoles.map((userRole) => userRole.role);
    }
  }

  private async addRoles(
    userId: number,
    newRoles: UserRole[],
    tenantId?: number,
  ) {
    if (tenantId) {
      const tenantUser = await this.db.query.tenantUsersTable.findFirst({
        where: and(
          eq(schema.tenantUsersTable.tenantId, tenantId),
          eq(schema.tenantUsersTable.userId, userId),
        ),
      });

      await this.db
        .insert(schema.tenantUserRolesTable)
        .values(
          newRoles.map((role) => ({
            tenantUserId: tenantUser.tenantUserId,
            role,
          })),
        )
        .execute();
    } else {
      await this.db
        .insert(schema.userRolesTable)
        .values(newRoles.map((role) => ({ userId, role })))
        .execute();
    }
  }

  private async removeRoles(
    userId: number,
    rolesToRemove: UserRole[],
    tenantId?: number,
  ) {
    if (tenantId) {
      const tenantUser = await this.db.query.tenantUsersTable.findFirst({
        where: and(
          eq(schema.tenantUsersTable.tenantId, tenantId),
          eq(schema.tenantUsersTable.userId, userId),
        ),
      });

      await this.db
        .delete(schema.tenantUserRolesTable)
        .where(
          and(
            eq(
              schema.tenantUserRolesTable.tenantUserId,
              tenantUser.tenantUserId,
            ),
            inArray(schema.tenantUserRolesTable.role, rolesToRemove),
          ),
        )
        .returning();
    } else {
      await this.db
        .delete(schema.userRolesTable)
        .where(
          and(
            eq(schema.userRolesTable.userId, userId),
            inArray(schema.userRolesTable.role, rolesToRemove),
          ),
        );
    }
  }
}
