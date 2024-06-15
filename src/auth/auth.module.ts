import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequestMetadataProvider } from './request-metadata.provider';

// All endpoints are secured by default. Authentication can be disabled with the custom decorator PublicEndpoint.
// Read: https://docs.nestjs.com/recipes/passport#enable-authentication-globally

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        // moved signInOptions to auth.service.ts, as access and refresh tokens use different options.
      }),
    }),
    UsersModule,
    EncryptionModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    { provide: 'APP_GUARD', useClass: JwtAuthGuard },
    { provide: 'APP_GUARD', useClass: PermissionsGuard },
    RequestMetadataProvider,
  ],
})
export class AuthModule {}
