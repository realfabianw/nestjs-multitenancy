import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmptyObject } from 'class-validator';
import UserResponseDto from '../../users/entities/dto/user-response.dto';

export class AuthenticationResponse {
  @ApiProperty({
    required: true,
  })
  @IsNotEmptyObject()
  user: UserResponseDto;
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
