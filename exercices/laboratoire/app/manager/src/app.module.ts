import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import * as process from 'node:process';
import { EnvSchema } from '@config/env/envSchema';
import { JobModule } from '@features/job/job.module';
import { BrokerModule } from '@shared/broker/broker.module';
import { BetterStackModule } from '@features/better-stack/better-stack.module';
import { BetterStackDefinition } from '@features/better-stack/definitions/better-stack.definition';
import { BrokerModuleOptions } from '@shared/broker/definitions/broker.definition';
import { BrokerService } from '@shared/broker/services/broker.service';
import { PluginModule } from '@features/plugin/plugin.module';
import { EnvModule } from '@config/env/env.module';
import { EnvService } from '@config/env/env.service';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { KeepaliveModule } from '@features/keepalive/keepalive.module';
import { MailModule } from '@features/mail/mail.module';

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
    HttpModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (configService: EnvService) => ({
        baseURL: configService.get('WAVES_BACK'),
      }),
    }),
    ScheduleModule.forRoot(),
    EnvModule,
    JobModule,
    BrokerModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (configService: EnvService) =>
        ({
          uri: configService.get('BROKER_URI'),
          username: configService.get('BROKER_USERNAME'),
          password: configService.get('BROKER_PASSWORD'),
          vhost: configService.get('BROKER_VHOST'),
        }) as BrokerModuleOptions,
    }),
    BetterStackModule.register({
      healthChecks: [],
      indicators: [],
    } as BetterStackDefinition),
    PluginModule,
    EnvModule,
    KeepaliveModule,
    MailModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly $broker: BrokerService) {}
  onModuleInit() {
    setTimeout(
      () =>
        this.initBroker().then(() => {
          Logger.log('Worker initialized', AppModule.name);
        }),
      200,
    );
  }
  private async initBroker() {
    // await this.$broker.createExchange('job', 'topic');
    // await this.$broker.createExchange('error', 'fanout');
    // await this.$broker.createExchange('plugin', 'fanout');
    // await this.$broker.createExchange('system', 'fanout');
    //
    // await this.$broker.createQueue('__heartbeat__');
    // await this.$broker.createQueue('waves-manager-job');
    // await this.$broker.createQueue('waves-manager-plugin');
    // await this.$broker.createQueue('waves-manager-keepalive');
    //
    // await this.$broker.bindQueue(
    //   'job',
    //   'waves-manager-job',
    //   'waves.job.update',
    // );
    // await this.$broker.bindQueue(
    //   'plugin',
    //   'waves-manager-plugin',
    //   'waves.plugin.register',
    // );
    // await this.$broker.bindQueue('system', 'waves-manager-keepalive', '');
  }
}
