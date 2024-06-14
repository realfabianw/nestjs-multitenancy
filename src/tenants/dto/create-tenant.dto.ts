import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    required: true,
    example: 'My Company',
  })
  name: string;
  @ApiProperty({
    required: true,
    example: 'A description of my company',
  })
  description: string;
}
