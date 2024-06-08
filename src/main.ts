import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // https://docs.nestjs.com/techniques/validation
  app.useGlobalPipes(new ValidationPipe());

  // Required for the cookie-based authentication
  app.use(cookieParser());

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
