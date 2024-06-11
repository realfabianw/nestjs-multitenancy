import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class DeleteUserResponseDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    required: true,
    example: 'john.doe@mail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
