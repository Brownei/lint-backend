import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import session from 'express-session';
// import cookieParser from 'cookie-parser';

async function server() {
  const docsRoute = 'docs';
  const port = process.env.APP_PORT || 3000;
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('LinT Api')
    .setDescription('The backend service for LinT')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(docsRoute, app, document);

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('/api');

  app.enableCors({
    origin: [
      'https://lint.onrender.com',
      'https://lint-app-five.vercel.app',
      /\.onrender\.com$/,
      /\.vercel\.app$/,
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(port);
  Logger.log(
    'Swagger is ready on: ' + 'http://localhost:' + port + '/' + docsRoute,
  );
  Logger.log('Application started on: ' + 'http://localhost:' + port);
}
server();
