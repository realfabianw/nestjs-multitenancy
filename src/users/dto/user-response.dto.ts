import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export default class UserResponseDto {
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
}