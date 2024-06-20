import { Controller, Body, Patch, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';
import UserDto from '../users/dto/user.dto';
import { RequiresPermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/entities/permissions.enum';
import { SystemRole, TenantRole } from './roles.schema';

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
    if (this.requestMetadata.getTenantId()) {
      // Update Tenant Role
      return await this.rolesService
        .updateTenantRole(
          +id,
          updateRoleDto.role as TenantRole,
          this.requestMetadata.getTenantId(),
        )
        .then((user) => UserDto.fromUser(user));
    } else {
      // Update System Role
      return await this.rolesService
        .updateSystemRole(+id, updateRoleDto.role as SystemRole)
        .then((user) => UserDto.fromUser(user));
    }
  }
}
