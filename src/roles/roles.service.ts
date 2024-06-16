import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { UsersService } from '../users/users.service';
import { SystemRole, TenantRole, User } from '../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
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
      .update(schema.users)
      .set({ role })
      .where(eq(schema.users.id, userId));

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
      .update(schema.tenantMemberships)
      .set({ role })
      .where(
        and(
          eq(schema.tenantMemberships.tenantId, tenantId),
          eq(schema.tenantMemberships.userId, userId),
        ),
      );

    return await this.usersService.findOne(userId, tenantId);
  }
}
