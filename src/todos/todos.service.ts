import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './entities/dto/create-todo.dto';
import { UpdateTodoDto } from './entities/dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Todo } from './entities/todo.entity';
import { Model } from 'mongoose';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  create(createTodoDto: CreateTodoDto) {
    return this.todoModel.create(createTodoDto);
  }

  findAll() {
    return this.todoModel.find().exec();
  }

  findOne(id: number) {
    return this.todoModel.findById(id).exec();
  }

  update(id: number, updateTodoDto: UpdateTodoDto) {
    return this.todoModel.findByIdAndUpdate(id, updateTodoDto).exec();
  }

  remove(id: number) {
    return this.todoModel.findByIdAndDelete(id).exec();
  }
}
