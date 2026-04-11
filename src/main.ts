import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app    = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin:      process.env.CORS_ORIGIN || 'http://localhost:4200',
    methods:     'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Comercial Motos API')
      .setDescription('API REST para sistema de ventas de motos, accesorios y repuestos')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger disponible en: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`App corriendo en: http://localhost:${port}/api`);
}
bootstrap();
