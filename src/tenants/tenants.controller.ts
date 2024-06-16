import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantDto } from './dto/tenant.dto';
import { RequiresPermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/entities/permissions.enum';
import { ApiTags } from '@nestjs/swagger';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly requestMetadata: RequestMetadataProvider,
  ) {}

  @RequiresPermissions(Permission.create_self)
  @Post()
  async create(@Body() createTenantDto: CreateTenantDto): Promise<TenantDto> {
    return this.tenantsService.create(
      createTenantDto,
      this.requestMetadata.getRequestingUserId(),
    );
  }

  @RequiresPermissions(Permission.tenant_read_all)
  @Get()
  async findAll(): Promise<TenantDto[]> {
    return this.tenantsService.findAll();
  }

  @RequiresPermissions(Permission.tenant_read_self)
  @Get(':id')
  async findOne(@Param('id') tenantId: string): Promise<TenantDto> {
    return this.tenantsService.findOne(+tenantId);
  }

  @RequiresPermissions(Permission.tenant_update_self)
  @Patch(':id')
  async update(
    @Param('id') tenantId: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantDto> {
    return this.tenantsService.update(+tenantId, updateTenantDto);
  }

  @RequiresPermissions(Permission.tenant_delete_self)
  @Delete(':id')
  async remove(@Param('id') tenantId: string): Promise<TenantDto> {
    return this.tenantsService.remove(+tenantId);
  }
}
