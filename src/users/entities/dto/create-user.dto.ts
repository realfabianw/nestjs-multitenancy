import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    required: true,
    example: 'john.doe@mail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
    example: 'MySecurePassword123!',
  })
  @IsNotEmpty()
  password: string;
}
