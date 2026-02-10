import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { LoggerInterceptor } from '@common/interceptors/logger.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'node:process';
import {
  betterStackLogger,
  LogLevel,
} from '@shared/logger/better-stack.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const $config = app.get(ConfigService);
  const $logger = new Logger('Bootstrap');

  app.useLogger(
    betterStackLogger('3053-waves-manager', {
      sourceToken: process.env.BETTER_STACK_TOKEN as string,
      endpoint: process.env.BETTER_STACK_ENDPOINT as string,
      logLevel: LogLevel.WARNING,
    }),
  );
  app.setGlobalPrefix('api');

  app.useGlobalPipes();
  app.useGlobalFilters(new HttpExceptionFilter());
  const allowedOrigins: string = $config.getOrThrow('ALLOW_ORIGINS');
  app.enableCors({
    origin:
      allowedOrigins.split(',') || (['http://localhost:3000'] as string[]),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalInterceptors(new LoggerInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Waves Manager's API")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {});
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.PORT ?? 3000);

  $logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
