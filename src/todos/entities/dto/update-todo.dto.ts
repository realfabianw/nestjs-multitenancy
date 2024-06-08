import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoDto } from './create-todo.dto';
import { ApiProperty } from '@nestjs/swagger';
import { TodoStatus } from '../todo-status.enum';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiProperty({
    required: false,
    example: 'Example Title',
  })
  title?: string;
  @ApiProperty({
    required: false,
    example: 'I am a description.',
  })
  description?: string;
  @ApiProperty({
    required: false,
    example: 'IN_PROGRESS',
  })
  status?: TodoStatus;
}
