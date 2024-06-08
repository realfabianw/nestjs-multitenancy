import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  @Get('me')
  async getUser(@Request() request) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userProperties } = request.user;
    return userProperties;
  }
}
