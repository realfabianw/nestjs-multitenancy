import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EncryptionService } from '../encryption/encryption.service';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { SelectUser, User } from '../drizzle/schema';
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
    const user: SelectUser = await this.db
      .insert(schema.usersTable)
      .values({
        email: createUserDto.email,
        password: await this.encryptionService.hash(createUserDto.password),
      })
      .returning()
      .then(takeUniqueOrThrow);

    await this.db.insert(schema.userRolesTable).values({
      userId: user.id,
    });

    return await this.findOne(user.id);
  }

  async findAll(): Promise<User[]> {
    return await this.db.query.usersTable.findMany({
      with: {
        roles: true,
        tenantUsers: {
          with: {
            roles: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<User> {
    return await this.db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, id),
      with: {
        roles: true,
        tenantUsers: {
          with: {
            roles: true,
          },
        },
      },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.db.query.usersTable.findFirst({
      where: eq(schema.usersTable.email, email),
      with: {
        roles: true,
        tenantUsers: {
          with: {
            roles: true,
          },
        },
      },
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.db
      .update(schema.usersTable)
      .set(updateUserDto)
      .where(eq(schema.usersTable.id, id));

    return await this.findOne(id);
  }

  async remove(id: number): Promise<SelectUser> {
    return await this.db
      .delete(schema.usersTable)
      .where(eq(schema.usersTable.id, id))
      .returning()
      .then(takeUniqueOrThrow);
  }
}

/**
 * 
Type '{ id: number; email: string; password: string; roles: { id: number; userId: number; role: "ADMIN" | "USER"; }[]; tenants: { userId: number; tenantUserId: number; tenantId: number; roles: { role: "ADMIN" | "USER"; tenantUserId: number; }[]; }[]; }' is not assignable to type 'User'.


Type 
  '{ id: number; email: string; password: string; roles: { id: number; userId: number; role: "ADMIN" | "USER"; }[]; tenants: { userId: number; tenantUserId: number; tenantId: number; roles: { role: "ADMIN" | "USER"; tenantUserId: number; }[]; }[]; }'
is not assignable to type
  '{ roles: { id: number; userId: number; role: "ADMIN" | "USER"; }[]; tenants: { userId: number; tenantUserId: number; tenantId: number; } & { roles: { role: "ADMIN" | "USER"; tenantUserId: number; }[]; }[]; }'.


  Types of property 'tenants' are incompatible.
Type 

'{ userId: number; tenantUserId: number; tenantId: number; roles: { role: "ADMIN" | "USER"; tenantUserId: number; }[]; }[]'
is not assignable to type
'{ userId: number; tenantUserId: number; tenantId: number; } & { roles: { role: "ADMIN" | "USER"; tenantUserId: number; }[]; }[]'.



Type
'{ userId: number; tenantUserId: number; tenantId: number; roles: { role: "ADMIN" | "USER"; tenantUserId: number; }[]; }[]'
is missing the following properties from type
'{ userId: number; tenantUserId: number; tenantId: number; }': userId, tenantUserId, tenantIdts(2322)
 * 
 * 
 */
