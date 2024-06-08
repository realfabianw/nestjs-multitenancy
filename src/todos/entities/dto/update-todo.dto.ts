import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoDto } from './create-todo.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiProperty({
    example: 'Example Title',
  })
  title?: string;
  @ApiProperty({
    example: 'I am a description.',
  })
  description?: string;
}
