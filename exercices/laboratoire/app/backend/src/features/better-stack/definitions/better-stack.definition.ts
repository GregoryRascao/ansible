import { ConfigurableModuleBuilder } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';

// export type BetterStackHealthIndicators = Partial<{
//   $health: HealthCheckService;
//   $http: HttpHealthIndicator;
//   $mongoose: MongooseHealthIndicator;
//   $sequelize: SequelizeHealthIndicator;
// }>;
//
// export type BetterStackHealthIndicatorOptions = (
//   indicators: BetterStackHealthIndicators[],
// ) => Promise<HealthIndicatorResult>;
//
// export interface BetterStackDefinition {
//   indicators: (
//     | HttpHealthIndicator
//     | MongooseHealthIndicator
//     | SequelizeHealthIndicator
//   )[];
//   healthCheck: BetterStackHealthIndicatorOptions[];
// }

export type BetterStackHealthCheckOption = (
  indicators: any[],
) => Promise<HealthIndicatorResult>;

export interface BetterStackDefinition {
  indicators: any[];
  healthChecks: BetterStackHealthCheckOption[];
}

export const betterStackModuleBuilder =
  new ConfigurableModuleBuilder<BetterStackDefinition>();
const betterStackModule = betterStackModuleBuilder.build();

export const BetterStackModuleOptionsToken =
  betterStackModule.MODULE_OPTIONS_TOKEN;
export const BetterStackConfigurableModule =
  betterStackModule.ConfigurableModuleClass;
