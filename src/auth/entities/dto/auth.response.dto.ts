import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmptyObject } from 'class-validator';
import UserDto from '../../../users/dto/user.dto';

export class AuthResponseDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmptyObject()
  user: UserDto;
  @ApiProperty({
    required: true,
  })
  @IsJWT()
  accessToken: string;
  @ApiProperty({
    required: true,
  })
  @IsJWT()
  refreshToken: string;
}
