import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { UsersService } from '../users/users.service';
import { drizzleSchema } from '../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';
import { SystemRole, TenantRole } from './roles.schema';
import { User } from '../users/users.schema';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  constructor(
    @Inject('DB_PROD')
    private readonly db: PostgresJsDatabase<typeof drizzleSchema>,
    private readonly usersService: UsersService,
    private readonly requestMetaData: RequestMetadataProvider,
  ) {}

  async updateSystemRole(userId: number, role: SystemRole): Promise<User> {
    if (
      role === 'ADMIN' &&
      !this.requestMetaData.isRequestingUserSystemAdmin()
    ) {
      throw new Error('Only system admins can assign ADMIN role.');
    }

    this.db
      .update(drizzleSchema.users)
      .set({ role })
      .where(eq(drizzleSchema.users.id, userId));

    return await this.usersService.findOne(userId);
  }

  async updateTenantRole(userId: number, role: TenantRole, tenantId: number) {
    if (
      role === 'ADMIN' &&
      !this.requestMetaData.isRequestingUserTenantAdmin()
    ) {
      throw new Error('Only tenant admins can assign ADMIN role.');
    }

    this.db
      .update(drizzleSchema.tenantMemberships)
      .set({ role })
      .where(
        and(
          eq(drizzleSchema.tenantMemberships.tenantId, tenantId),
          eq(drizzleSchema.tenantMemberships.userId, userId),
        ),
      );

    return await this.usersService.findOne(userId, tenantId);
  }
}
