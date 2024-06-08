import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

// All endpoints are secured by default. Authentication can be disabled with the custom decorator PublicEndpoint.
// Read: https://docs.nestjs.com/recipes/passport#enable-authentication-globally

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('ACCESS_TOKEN_JWT_EXPIRES_IN'),
        },
      }),
    }),
    UsersModule,
    EncryptionModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: 'APP_GUARD', useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
