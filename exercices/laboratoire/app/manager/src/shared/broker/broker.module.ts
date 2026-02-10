// broker/broker.module.ts
import { Module } from '@nestjs/common';
import { BrokerService } from './services/broker.service';
import { BrokerConfigurableModule } from './definitions/broker.definition';

@Module({
  providers: [BrokerService],
  exports: [BrokerService],
})
export class BrokerModule extends BrokerConfigurableModule {}
