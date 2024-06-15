import { IsArray, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../drizzle/schema';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ required: true, example: ['SYSTEM_USER'], type: [String] })
  @IsNotEmpty()
  @IsArray()
  roles: UserRole[];
}
