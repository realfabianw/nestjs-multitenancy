import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserRole } from '../../drizzle/schema';

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
  roles: UserRole[];

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  tenantMemberships: { tenantId: number; roles: UserRole[] }[];
}
