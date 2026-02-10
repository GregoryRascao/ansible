import { DatabaseModule } from '@database/database.module';
import { BetterStackModule } from '@features/better-stack/better-stack.module';
import { BetterStackDefinition } from '@features/better-stack/definitions/better-stack.definition';
import { CronModule } from '@features/cron/cron.module';
import { JobModule } from '@features/job/job.module';
import { PluginModule } from '@features/plugin/plugin.module';
import { WorkerModule } from '@features/worker/worker.module';
import { WorkflowModule } from '@features/workflow/workflow.module';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseHealthIndicator } from '@nestjs/terminus';
import {
  AuthGuard,
  KeycloakConnectModule,
  ResourceGuard,
} from 'nest-keycloak-connect';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import * as process from 'node:process';
import { EnvModule } from '@config/env/env.module';
import { EnvSchema } from '@config/env/envSchema';
import { EnvService } from '@config/env/env.service';

function getConfigModuleOptions() {
  const env = process.env.NODE_ENV;

  if (env == 'development') {
    return {
      isGlobal: true,
      validate: (env) => EnvSchema.parse(env),
      envFilePath: './env/.env.development',
      validationOptions: {
        convert: true,
        allowUnknown: true,
        abortEarly: false,
        stripUnknown: true,
      },
    } as ConfigModuleOptions;
  } else {
    return {
      isGlobal: true,
      validate: (env) => EnvSchema.parse(env),
      ignoreEnvFile: true,
      validationOptions: {
        convert: true,
        allowUnknown: true,
        abortEarly: false,
        stripUnknown: true,
      },
    } as ConfigModuleOptions;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot(getConfigModuleOptions()),
    BetterStackModule.register({
      indicators: [MongooseHealthIndicator] as any[],
      healthChecks: [],
    } as BetterStackDefinition),
    EnvModule,
    KeycloakConnectModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (configService: EnvService) => {
        return {
          authServerUrl: configService.get('KEYCLOAK_AUTH_SERVER_URL'),
          realm: configService.get('KEYCLOAK_REALM'),
          clientId: configService.get('KEYCLOAK_CLIENT_ID'),
          secret: configService.get('KEYCLOAK_SECRET'),
        };
      },
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    WorkerModule,
    WorkflowModule,
    PluginModule,
    JobModule,
    CronModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ResourceGuard },
    // { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    Logger.warn('AppModule initialized');
  }
}
