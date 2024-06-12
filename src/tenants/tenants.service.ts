import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { SelectTenant, SelectTenantUser, User } from '../drizzle/schema';
import { REQUEST } from '@nestjs/core';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { takeUniqueOrThrow } from '../drizzle/extensions';
import { Request } from 'express';
import { eq } from 'drizzle-orm';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<SelectTenant> {
    const user = this.request.user as User;
    const tenant: SelectTenant = await this.db
      .insert(schema.tenantsTable)
      .values(createTenantDto)
      .returning()
      .then(takeUniqueOrThrow);

    const tenantUser: SelectTenantUser = await this.db
      .insert(schema.tenantUsersTable)
      .values({
        tenantId: tenant.id,
        userId: user.id,
      })
      .returning()
      .then(takeUniqueOrThrow);

    await this.db
      .insert(schema.tenantUserRolesTable)
      .values({
        tenantUserId: tenantUser.tenantUserId,
        role: 'TENANT_ADMIN',
      })
      .returning()
      .then(takeUniqueOrThrow);

    return tenant;
  }

  async findAll(): Promise<SelectTenant[]> {
    return await this.db.select().from(schema.tenantsTable);
  }

  async findOne(id: number): Promise<SelectTenant> {
    return await this.db.query.tenantsTable.findFirst({
      where: eq(schema.tenantsTable.id, id),
    });
  }

  async update(
    id: number,
    updateTenantDto: UpdateTenantDto,
  ): Promise<SelectTenant> {
    await this.db
      .update(schema.tenantsTable)
      .set(updateTenantDto)
      .where(eq(schema.tenantsTable.id, id));

    return await this.findOne(id);
  }

  async remove(id: number): Promise<SelectTenant> {
    return await this.db
      .delete(schema.tenantsTable)
      .where(eq(schema.tenantsTable.id, id))
      .then(takeUniqueOrThrow);
  }
}
