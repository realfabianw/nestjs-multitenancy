import { Controller, Body, Patch, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';
import UserDto from '../users/dto/user.dto';
import { User } from '../drizzle/schema';
import { RequiresPermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/entities/permissions.enum';

@ApiTags('Roles')
@Controller('users/:id/roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly requestMetadata: RequestMetadataProvider,
  ) {}

  @RequiresPermissions(Permission.update_all, Permission.tenant_update_all)
  @Patch()
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<UserDto> {
    const user: User = await this.rolesService.update(
      +id,
      updateRoleDto,
      this.requestMetadata.getTenantId(),
    );
    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.role),
      tenantMemberships: user.tenantUsers.map((tenantUser) => ({
        tenantId: tenantUser.tenantId,
        roles: tenantUser.roles.map((role) => role.role),
      })),
    };
  }
}
