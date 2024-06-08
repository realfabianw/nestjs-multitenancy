import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Get('me')
  async getUser(@Request() request) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userProperties } = request.user;
    return userProperties;
  }
}
