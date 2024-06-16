import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { SelectTenant } from '../drizzle/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { takeUniqueOrThrow } from '../drizzle/extensions';
import { eq } from 'drizzle-orm';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(
    createTenantDto: CreateTenantDto,
    userId: number,
  ): Promise<SelectTenant> {
    const tenant: SelectTenant = await this.db
      .insert(schema.tenants)
      .values(createTenantDto)
      .returning()
      .then(takeUniqueOrThrow);

    await this.db
      .insert(schema.tenantMemberships)
      .values({
        tenantId: tenant.id,
        userId: userId,
        role: 'ADMIN',
      })
      .returning()
      .then(takeUniqueOrThrow);

    return tenant;
  }

  async findAll(): Promise<SelectTenant[]> {
    return await this.db.select().from(schema.tenants);
  }

  async findOne(id: number): Promise<SelectTenant> {
    return await this.db.query.tenants.findFirst({
      where: eq(schema.tenants.id, id),
    });
  }

  async update(
    id: number,
    updateTenantDto: UpdateTenantDto,
  ): Promise<SelectTenant> {
    await this.db
      .update(schema.tenants)
      .set(updateTenantDto)
      .where(eq(schema.tenants.id, id));

    return await this.findOne(id);
  }

  async remove(id: number): Promise<SelectTenant> {
    return await this.db
      .delete(schema.tenants)
      .where(eq(schema.tenants.id, id))
      .then(takeUniqueOrThrow);
  }
}
