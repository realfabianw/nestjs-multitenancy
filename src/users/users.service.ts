import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EncryptionService } from '../encryption/encryption.service';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { SelectUser, User } from '../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { takeUniqueOrThrow } from '../drizzle/extensions';
import { InviteUserDto } from './dto/invite-user.dto';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @Inject('DB_PROD') private readonly db: PostgresJsDatabase<typeof schema>,
    @Inject(REQUEST) private request: Request,
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

  async invite(inviteUserDto: InviteUserDto, tenantId?: number) {
    // TODO: Send invitation email. For now, create user with a default password
    const userToInvite: User = await this.create({
      email: inviteUserDto.email,
      password: 'MySecurePassword123!',
    });

    if (tenantId) {
      // Add the new user to the tenant
      const tenantUser = await this.db
        .insert(schema.tenantUsersTable)
        .values({
          tenantId: tenantId,
          userId: userToInvite.id,
        })
        .returning()
        .then(takeUniqueOrThrow);

      await this.db.insert(schema.tenantUserRolesTable).values({
        tenantUserId: tenantUser.tenantUserId,
        role: 'TENANT_USER',
      });
    }
  }

  async findAll(tenantId?: number): Promise<User[]> {
    if (tenantId) {
      const entries = await this.db.query.tenantUsersTable.findMany({
        where: eq(schema.tenantUsersTable.tenantId, tenantId),
        with: {
          user: {
            with: {
              roles: true,
              tenantUsers: {
                where: eq(schema.tenantUsersTable.tenantId, tenantId),
                with: {
                  roles: true,
                },
              },
            },
          },
        },
      });

      return entries.map((entry) => entry.user);
    } else {
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
  }

  async findOne(id: number, tenantId?: number): Promise<User> {
    if (tenantId) {
      const entry = await this.db.query.tenantUsersTable.findFirst({
        where: and(
          eq(schema.tenantUsersTable.tenantId, tenantId),
          eq(schema.tenantUsersTable.userId, id),
        ),
        with: {
          user: {
            with: {
              roles: true,
              tenantUsers: {
                where: eq(schema.tenantUsersTable.tenantId, tenantId),
                with: {
                  roles: true,
                },
              },
            },
          },
        },
      });

      return entry.user;
    } else {
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

  async remove(id: number, tenantId?: number) {
    if (tenantId) {
      await this.db
        .delete(schema.tenantUsersTable)
        .where(
          and(
            eq(schema.tenantUsersTable.tenantId, tenantId),
            eq(schema.tenantUsersTable.userId, id),
          ),
        );
    } else {
      await this.db
        .delete(schema.usersTable)
        .where(eq(schema.usersTable.id, id));
    }
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
