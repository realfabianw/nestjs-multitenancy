import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Delete,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import UserDto from './dto/user.dto';
import { User } from '../drizzle/schema';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequiresPermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/entities/permissions.enum';
import { Response } from 'express';
import { TenantProvider } from '../auth/tenant.provider';
import { InviteUserDto } from './dto/invite-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tenantProvider: TenantProvider,
  ) {}

  /**
   * TODO: This function is currently similar to auth/register.
   * It is intended to be used for user invitation by other admin users.
   * Maybe this endpoint can be removed if the DTO is modified.
   * @param userDto
   * @returns
   */
  @RequiresPermissions(Permission.create_all, Permission.tenant_create_self)
  @Post()
  async invite(@Body() inviteUserDto: InviteUserDto) {
    await this.usersService.invite(
      inviteUserDto,
      this.tenantProvider.isTenantRequest && this.tenantProvider.tenantId,
    );
  }

  @Get('me')
  async findAuthenticatedUser(@Request() request): Promise<UserDto> {
    const user: User = request.user;
    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.role),
    };
  }

  @RequiresPermissions(Permission.read_all, Permission.tenant_read_all)
  @Get()
  async findAll(): Promise<UserDto[]> {
    const users = await this.usersService.findAll(
      this.tenantProvider.isTenantRequest && this.tenantProvider.tenantId,
    );
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.role),
    }));
  }

  @RequiresPermissions(Permission.read_self, Permission.tenant_read_self)
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const user: User = await this.usersService.findOne(
      +id,
      this.tenantProvider.isTenantRequest && this.tenantProvider.tenantId,
    );

    if (!user) {
      response.status(404).json({ message: 'User not found' });
    } else {
      response.status(200).json({
        id: user.id,
        email: user.email,
        roles: user.roles.map((role) => role.role),
      });
    }
  }

  @RequiresPermissions(Permission.update_self)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const user: User = await this.usersService.update(+id, updateUserDto);
    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.role),
    };
  }

  @RequiresPermissions(Permission.delete_self, Permission.tenant_delete_self)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(
      +id,
      this.tenantProvider.isTenantRequest && this.tenantProvider.tenantId,
    );
  }
}
