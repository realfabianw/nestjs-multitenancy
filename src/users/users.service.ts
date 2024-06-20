import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EncryptionService } from '../encryption/encryption.service';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzleSchema } from '../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { takeUniqueOrThrow } from '../drizzle/extensions';
import { InviteUserDto } from './dto/invite-user.dto';
import { SelectUser, User } from './users.schema';

/**
 * It seems that every service that is related to Passport and its JWT authentication strategy is not
 * permitted to be injected at request scope. The JWT authentication fails when this service is request-scoped,
 * as it is currently used in JwtStrategy.ts. Read more: https://github.com/nestjs/nest/issues/1870
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @Inject('DB_PROD')
    private readonly db: PostgresJsDatabase<typeof drizzleSchema>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    const user: SelectUser = await this.db
      .insert(drizzleSchema.users)
      .values({
        email: createUserDto.email,
        password: await this.encryptionService.hash(createUserDto.password),
      })
      .returning()
      .then(takeUniqueOrThrow);

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
      await this.db.insert(drizzleSchema.tenantMemberships).values({
        tenantId: tenantId,
        userId: userToInvite.id,
        role: 'MEMBER',
      });
    }
  }

  async findAll(tenantId?: number): Promise<User[]> {
    if (tenantId) {
      const entries = await this.db.query.tenantMemberships.findMany({
        where: eq(drizzleSchema.tenantMemberships.tenantId, tenantId),
        with: {
          user: {
            with: {
              tenantMemberships: {
                where: eq(drizzleSchema.tenantMemberships.tenantId, tenantId),
              },
            },
          },
        },
      });

      return entries.map((entry) => entry.user);
    } else {
      return await this.db.query.users.findMany({
        with: {
          tenantMemberships: true,
        },
      });
    }
  }

  async findOne(id: number, tenantId?: number): Promise<User> {
    if (tenantId) {
      const entry = await this.db.query.tenantMemberships.findFirst({
        where: and(
          eq(drizzleSchema.tenantMemberships.tenantId, tenantId),
          eq(drizzleSchema.tenantMemberships.userId, id),
        ),
        with: {
          user: {
            with: {
              tenantMemberships: {
                where: eq(drizzleSchema.tenantMemberships.tenantId, tenantId),
              },
            },
          },
        },
      });

      return entry.user;
    } else {
      return await this.db.query.users.findFirst({
        where: eq(drizzleSchema.users.id, id),
        with: {
          tenantMemberships: true,
        },
      });
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.db.query.users.findFirst({
      where: eq(drizzleSchema.users.email, email),
      with: {
        tenantMemberships: true,
      },
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.db
      .update(drizzleSchema.users)
      .set(updateUserDto)
      .where(eq(drizzleSchema.users.id, id));

    return await this.findOne(id);
  }

  async remove(id: number, tenantId?: number) {
    if (tenantId) {
      await this.db
        .delete(drizzleSchema.tenantMemberships)
        .where(
          and(
            eq(drizzleSchema.tenantMemberships.tenantId, tenantId),
            eq(drizzleSchema.tenantMemberships.userId, id),
          ),
        );
    } else {
      await this.db
        .delete(drizzleSchema.users)
        .where(eq(drizzleSchema.users.id, id));
    }
  }
}
