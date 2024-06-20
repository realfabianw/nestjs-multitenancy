import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { SelectTenant, drizzleSchema } from '../drizzle/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { takeUniqueOrThrow } from '../drizzle/extensions';
import { eq } from 'drizzle-orm';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @Inject('DB_PROD')
    private readonly db: PostgresJsDatabase<typeof drizzleSchema>,
  ) {}

  async create(
    createTenantDto: CreateTenantDto,
    userId: number,
  ): Promise<SelectTenant> {
    const tenant: SelectTenant = await this.db
      .insert(drizzleSchema.tenants)
      .values(createTenantDto)
      .returning()
      .then(takeUniqueOrThrow);

    await this.db
      .insert(drizzleSchema.tenantMemberships)
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
    return await this.db.select().from(drizzleSchema.tenants);
  }

  async findOne(id: number): Promise<SelectTenant> {
    return await this.db.query.tenants.findFirst({
      where: eq(drizzleSchema.tenants.id, id),
    });
  }

  async update(
    id: number,
    updateTenantDto: UpdateTenantDto,
  ): Promise<SelectTenant> {
    await this.db
      .update(drizzleSchema.tenants)
      .set(updateTenantDto)
      .where(eq(drizzleSchema.tenants.id, id));

    return await this.findOne(id);
  }

  async remove(id: number): Promise<SelectTenant> {
    return await this.db
      .delete(drizzleSchema.tenants)
      .where(eq(drizzleSchema.tenants.id, id))
      .then(takeUniqueOrThrow);
  }
}
