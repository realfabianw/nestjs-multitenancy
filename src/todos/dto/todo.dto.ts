import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SelectTodo } from '../../drizzle/schema';

export class TodoDto {
  @ApiProperty({
    required: true,
    example: 1,
  })
  @IsNotEmpty()
  id: number;
  @ApiProperty({
    required: true,
    example: 'My Todo',
  })
  @IsNotEmpty()
  title: string;
  @ApiProperty({
    required: true,
    example: 'A description of my todo',
  })
  @IsNotEmpty()
  description: string;

  static fromEntity(todo: SelectTodo): TodoDto {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
    };
  }
}
