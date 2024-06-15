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

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto): Promise<TenantDto> {
    return this.tenantsService.create(
      createTenantDto,
      this.requestMetadata.getUserId(),
    );
  }

  @RequiresPermissions(Permission.tenant_read_all)
  @Get()
  async findAll(): Promise<TenantDto[]> {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TenantDto> {
    return this.tenantsService.findOne(+id);
  }

  @RequiresPermissions(Permission.tenant_update_self)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantDto> {
    return this.tenantsService.update(+id, updateTenantDto);
  }

  @RequiresPermissions(Permission.tenant_delete_self)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<TenantDto> {
    return this.tenantsService.remove(+id);
  }
}
