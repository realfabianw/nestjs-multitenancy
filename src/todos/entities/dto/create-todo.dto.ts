import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({
    required: true,
    example: 'Example Title',
  })
  @IsNotEmpty()
  title: string;
  @ApiProperty({
    required: true,
    example: 'I am a description.',
  })
  @IsNotEmpty()
  description: string;
}
