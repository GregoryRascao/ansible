import {
  BetterStackConfigurableModule,
  BetterStackDefinition,
  BetterStackModuleOptionsToken,
} from '@features/better-stack/definitions/better-stack.definition';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { BetterStackController } from './better-stack.controller';

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
