import { Module } from '@nestjs/common';
import { BetterStackController } from './better-stack.controller';
import { TerminusModule } from '@nestjs/terminus';
import {
  BetterStackConfigurableModule,
  BetterStackDefinition,
  BetterStackModuleOptionsToken,
} from '@features/better-stack/definitions/better-stack.definition';

@Module({
  imports: [
    TerminusModule.forRoot({ gracefulShutdownTimeoutMs: 1000, logger: false }),
  ],
  controllers: [BetterStackController],
  providers: [
    {
      provide: 'BETTERSTACK_INDICATORS',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      useFactory: (options: BetterStackDefinition) => options.indicators,
      inject: [BetterStackModuleOptionsToken],
    },
  ],
})
export class BetterStackModule extends BetterStackConfigurableModule {}
