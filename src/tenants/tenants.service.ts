import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';
import { REQUEST } from '@nestjs/core';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    return 'This action adds a new tenant';
  }

  async findAll(): Promise<Tenant> {
    return `This action returns all tenants`;
  }

  async findOne(id: number): Promise<Tenant> {
    return `This action returns a #${id} tenant`;
  }

  async update(id: number, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    return `This action updates a #${id} tenant`;
  }

  async remove(id: number): Promise<Tenant> {
    return `This action removes a #${id} tenant`;
  }
}
