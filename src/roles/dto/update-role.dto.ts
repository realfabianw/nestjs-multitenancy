import { IsArray, IsNotEmpty } from 'class-validator';
import { SystemRole, TenantRole } from '../../drizzle/schema';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ required: true, example: ['MEMBER'], type: [String] })
  @IsNotEmpty()
  @IsArray()
  role: SystemRole | TenantRole;
}
