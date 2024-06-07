import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './entities/dto/create-user.dto';
import { UpdateUserDto } from './entities/dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly encryptionService: EncryptionService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    return this.userModel.create({
      email: createUserDto.email,
      password: await this.encryptionService.hash(createUserDto.password),
    });
  }

  findAll() {
    return this.userModel.find().exec();
  }

  findOne(id: number) {
    return this.userModel.findById(id).exec();
  }

  findOneByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto).exec();
  }

  remove(id: number) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
