import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ExchangeType } from '../services/broker.service';

export interface BrokerModuleOptions {
  uri: string;
  username: string;
  password: string;
  exchange?: { name: string; type: ExchangeType };
}

const brokerModuleBuilder =
  new ConfigurableModuleBuilder<BrokerModuleOptions>();
const brokerModule = brokerModuleBuilder
  .setExtras({ isGlobal: true }, (def, extras) => ({
    ...def,
    global: extras.isGlobal,
  }))
  .build();

export const BrokerModuleOptionsToken = brokerModule.MODULE_OPTIONS_TOKEN;
export const BrokerConfigurableModule = brokerModule.ConfigurableModuleClass;
