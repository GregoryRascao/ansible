import {
  BetterStackDefinition,
  BetterStackModuleOptionsToken,
} from '@features/better-stack/definitions/better-stack.definition';
import { Controller, Get, Inject, Logger } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class BetterStackController {
  constructor(
    private readonly $health: HealthCheckService,
    @Inject(BetterStackModuleOptionsToken)
    private readonly $betterStack: BetterStackDefinition,
    private readonly $mongoose: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  getStatus() {
    Logger.log('Checking health', BetterStackController.name);

    return { status: 'ok' };
  }
}
