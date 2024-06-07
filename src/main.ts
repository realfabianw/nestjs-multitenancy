import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // https://docs.nestjs.com/techniques/validation
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Authenticated TODO Application')
    .setDescription(
      'This project is a simple TODO application with authentication and multi-tenancy support.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
