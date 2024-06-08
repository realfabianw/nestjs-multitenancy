import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class JwtResponse {
  @ApiProperty({
    required: true,
  })
  @IsJWT()
  token: string;
}
