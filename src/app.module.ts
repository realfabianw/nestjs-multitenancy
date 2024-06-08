import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HttpLoggerMiddleware } from './http-logger.middleware';
import { TodosModule } from './todos/todos.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './env-validation.schema';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import * as dbSchema from './drizzle/schema';

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
          schema: dbSchema,
        },
      }),
    }),
    AuthModule,
    UsersModule,
    TodosModule,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
