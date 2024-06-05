import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TodoStatus } from './todo-status.enum';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Todo {
  @Prop()
  _id: string;
  @Prop()
  title: string;
  @Prop()
  description: string;
  @Prop()
  status: TodoStatus;
}

export type TodoDocument = HydratedDocument<Todo>;
export const TodoSchema = SchemaFactory.createForClass(Todo);
