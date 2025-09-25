import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateEnvironment } from './config/app.config';

async function bootstrap() {
  validateEnvironment();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Organization Management API')
    .setDescription('API for managing organizations, tax obligations, and compliance schedules')
    .setVersion('1.0')
    .addTag('organizations', 'Organization management endpoints')
    .addTag('tax-obligations', 'Tax obligation management endpoints')
    .addTag('org-obligations', 'Organization obligation management endpoints')
    .addTag('schedules', 'Compliance schedule management endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
