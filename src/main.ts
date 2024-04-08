import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const documentBuilder = new DocumentBuilder()
    .setTitle('Humidefi Teleport')
    .setDescription('Humidefi Teleport NestJS API Documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, document);

  config()

  await app.listen(3000);
}
bootstrap();
