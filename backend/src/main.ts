import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 配置全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 配置 CORS
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('Tech Community Platform API')
    .setDescription('API documentation for Tech Community Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3002);
  console.log('Application is running on: http://localhost:3002');
  console.log('Swagger documentation is available at: http://localhost:3002/api');
}

bootstrap();
