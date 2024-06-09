import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // https://docs.nestjs.com/techniques/validation
  app.useGlobalPipes(new ValidationPipe());

  // Required for the cookie-based authentication
  app.use(cookieParser());

  // Database Migration
  try {
    const migrationClient = postgres(configService.get('POSTGRES_URL_PROD'));
    migrate(drizzle(migrationClient), {
      migrationsFolder: './drizzle',
      migrationsSchema: 'application',
      migrationsTable: 'migrations',
    });
    logger.log('Database migrated successfully');
  } catch (err) {
    logger.error('Error migrating database', err);
  }

  // Swagger OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Authenticated TODO Application')
    .setDescription(
      'This project is a simple TODO application with authentication and multi-tenancy support.',
    )
    .setVersion('1.0')
    .addCookieAuth(configService.get('ACCESS_TOKEN_NAME'))
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('PORT'));
}
bootstrap();
