import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HttpLoggerMiddleware } from './http-logger.middleware';
import { TodosModule } from './todos/todos.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './env-validation.schema';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import { TenantsModule } from './tenants/tenants.module';
import { RolesModule } from './roles/roles.module';
import { drizzleSchema } from './drizzle/schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: envValidationSchema,
      isGlobal: true,
    }),
    DrizzlePostgresModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      tag: 'DB_PROD',
      useFactory: async (configService: ConfigService) => ({
        postgres: {
          url: configService.get<string>('POSTGRES_URL_PROD'),
        },
        config: {
          schema: drizzleSchema,
        },
      }),
    }),
    AuthModule,
    UsersModule,
    TenantsModule,
    TodosModule,
    RolesModule,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
