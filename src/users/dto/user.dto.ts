import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SystemRole, TenantRole, User } from '../../drizzle/schema';

export default class UserDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  role: SystemRole;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  tenantMemberships: { tenantId: number; role: TenantRole }[];

  static fromUser(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantMemberships: user.tenantMemberships.map((membership) => ({
        tenantId: membership.tenantId,
        role: membership.role,
      })),
    };
  }
}
