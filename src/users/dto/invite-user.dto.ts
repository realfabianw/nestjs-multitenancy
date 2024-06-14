import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class InviteUserDto {
  @ApiProperty({
    required: true,
    example: 'jane.doe@mail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
