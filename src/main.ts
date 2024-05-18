import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function server() {
  const docsRoute = 'docs';
  const port = process.env.APP_PORT || 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  const config = new DocumentBuilder()
    .setTitle('LinT Api')
    .setDescription('The backend service for LinT')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(docsRoute, app, document);

  app.use(
    session({
      secret: process.env.JWT_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60000,
      },
    }),
  );

  app.enableCors();
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port);
  Logger.log(
    'Swagger is ready on: ' + 'http://localhost:' + port + '/' + docsRoute,
  );
  Logger.log('Application started on: ' + 'http://localhost:' + port);
}
server();
