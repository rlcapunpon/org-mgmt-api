import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateEnvironment } from './config/app.config';

async function bootstrap() {
  validateEnvironment();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Organization Management API')
    .setDescription(
      'API for managing organizations, tax obligations, and compliance schedules',
    )
    .setVersion('1.0')
    .addTag('Organizations', 'Organization management endpoints')
    .addTag('Tax Obligations', 'Tax obligation management endpoints')
    .addTag(
      'Organization Obligations',
      'Organization obligation management endpoints',
    )
    .addTag('Schedules', 'Compliance schedule management endpoints')
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

  // Set global API prefix, excluding health and docs endpoints
  app.setGlobalPrefix('api/org', {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'docs', method: RequestMethod.GET },
      { path: 'docs-json', method: RequestMethod.GET },
    ],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
