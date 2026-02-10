// broker/definitions/broker.definition.ts
import { ConfigurableModuleBuilder } from '@nestjs/common';

export type ExchangeType = 'direct' | 'topic' | 'headers' | 'fanout';

export interface BrokerModuleOptions {
  uri: string;
  username: string;
  password: string;
  protocol?: 'amqp' | 'amqps';
  port?: number;
  vhost?: string;
}

const brokerModuleBuilder =
  new ConfigurableModuleBuilder<BrokerModuleOptions>();
export const brokerModule = brokerModuleBuilder
  .setExtras({ isGlobal: true }, (def, extras) => ({
    ...def,
    global: extras.isGlobal,
  }))
  .build();

export const BrokerModuleOptionsToken = brokerModule.MODULE_OPTIONS_TOKEN;
export const BrokerConfigurableModule = brokerModule.ConfigurableModuleClass;
