import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EncryptionService } from '../encryption/encryption.service';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { User } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { takeUniqueOrThrow } from '../drizzle/extensions';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly encryptionService: EncryptionService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    return await this.db
      .insert(schema.usersTable)
      .values({
        email: createUserDto.email,
        password: await this.encryptionService.hash(createUserDto.password),
      })
      .returning()
      .then(takeUniqueOrThrow);
  }

  async findAll(): Promise<User[]> {
    return await this.db.select().from(schema.usersTable);
  }

  async findOne(id: number): Promise<User> {
    return await this.db
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.id, id))
      .then(takeUniqueOrThrow);
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.db
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.email, email))
      .then(takeUniqueOrThrow);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.db
      .update(schema.usersTable)
      .set(updateUserDto)
      .where(eq(schema.usersTable.id, id))
      .returning()
      .then(takeUniqueOrThrow);
  }

  async remove(id: number): Promise<User> {
    return await this.db
      .delete(schema.usersTable)
      .where(eq(schema.usersTable.id, id))
      .returning()
      .then(takeUniqueOrThrow);
  }
}
