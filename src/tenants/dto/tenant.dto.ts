import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TenantDto {
  @ApiProperty({
    required: true,
    example: 1,
  })
  @IsNotEmpty()
  id: number;
  @ApiProperty({
    required: true,
    example: 'My Company',
  })
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    required: true,
    example: 'A description of my company',
  })
  @IsNotEmpty()
  description: string;
}
