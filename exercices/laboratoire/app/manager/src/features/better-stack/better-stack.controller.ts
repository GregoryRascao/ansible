import { Controller, Get, Inject, Logger } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import {
  BetterStackDefinition,
  BetterStackModuleOptionsToken,
} from '@features/better-stack/definitions/better-stack.definition';

@Controller('health')
export class BetterStackController {
  constructor(private readonly $health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  getStatus() {
    Logger.log('Checking health', BetterStackController.name);

    return { status: 'ok' };
  }
}
