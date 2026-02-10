import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { LoggerInterceptor } from '@common/interceptors/logger.interceptor';
import { NestFactory } from '@nestjs/core';
import {
  betterStackLogger,
  LogLevel,
} from '@shared/logger/better-stack.logger';
import { AppModule } from './app.module';
import { EnvService } from '@config/env/env.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const $config = app.get(EnvService);
  const $logger = new Logger('Bootstrap');

  app.useLogger(
    betterStackLogger('Waves - Backend', {
      sourceToken: $config.get('BETTER_STACK_TOKEN'),
      endpoint: $config.get('BETTER_STACK_ENDPOINT'),
      logLevel: LogLevel.ERROR,
    }),
  );
  app.setGlobalPrefix('api');

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //     transformOptions: {
  //       enableImplicitConversion: true,
  //     },
  //   }),
  // );
  app.useGlobalFilters(new HttpExceptionFilter());
  const allowedOrigins: string = $config.get('ALLOW_ORIGINS');
  app.enableCors({
    origin:
      allowedOrigins.split(',') || (['http://localhost:3000'] as string[]),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    // new TransformInterceptor(reflector),
    new LoggerInterceptor(),
  );

  if ($config.get('NODE_ENV') !== 'production') {
    // const swaggerConfig = new DocumentBuilder()
    //   .setTitle($config.get('APP_TITLE') || 'Core Api')
    //   .setVersion('1.0')
    //   .addBearerAuth()
    //   .build();
    //
    // const document = SwaggerModule.createDocument(app, swaggerConfig, {});
    // SwaggerModule.setup('doc', app, document);
  }
  await app.listen(3000);

  $logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
