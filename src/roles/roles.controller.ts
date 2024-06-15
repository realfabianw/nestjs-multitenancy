import { Controller, Body, Patch, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequestMetadataProvider } from '../auth/request-metadata.provider';

@ApiTags('Roles')
@Controller('users/:id/roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly requestMetadata: RequestMetadataProvider,
  ) {}

  @Patch()
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(
      +id,
      updateRoleDto,
      this.requestMetadata.getTenantId(),
    );
  }
}
