import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';


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

  // 配置静态文件服务，用于访问上传的头像
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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

  const port = process.env.BACKENDPORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}

bootstrap();
