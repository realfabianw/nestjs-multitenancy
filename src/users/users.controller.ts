import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import UserDto from './dto/user.dto';
import { User } from '../drizzle/schema';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/authorization.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * TODO: This function is currently similar to auth/register.
   * It is intended to be used for user invitation by other admin users.
   * Maybe this endpoint can be removed if the DTO is modified.
   * @param userDto
   * @returns
   */
  @Roles('SYSTEM_ADMIN', 'TENANT_ADMIN')
  @Post()
  async create(@Body() userDto: CreateUserDto): Promise<UserDto> {
    const user = await this.usersService.create(userDto);
    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.role),
    };
  }

  @Roles('SYSTEM_ADMIN', 'TENANT_ADMIN')
  @Get('me')
  async findAuthenticatedUser(@Request() request): Promise<UserDto> {
    const user: User = request.user;
    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.role),
    };
  }

  @Get()
  async findAll(): Promise<UserDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.role),
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserDto> {
    const user: User = await this.usersService.findOne(+id);
    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.role),
    };
  }

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

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(+id);
  }
}
