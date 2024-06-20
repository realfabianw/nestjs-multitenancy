import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SystemRole, TenantRole } from '../roles.schema';

export class UpdateRoleDto {
  @ApiProperty({ required: true, example: ['MEMBER'], type: [String] })
  @IsNotEmpty()
  @IsArray()
  role: SystemRole | TenantRole;
}
