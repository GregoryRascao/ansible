import { Logger, OnModuleInit } from '@nestjs/common';
import { BrokerService } from '@shared/broker/services/broker.service';

export abstract class BrokerConsumerService implements OnModuleInit {
  constructor(protected readonly $broker: BrokerService) {
    this.$broker.onReconnect(() => this.initConsumer());
  }

  async onModuleInit() {
    await this.initConsumer();
  }

  private async initConsumer() {
    const consumers = Reflect.getMetadata('consumers', this.constructor) || [];
    for (const {
      exchange,
      exchangeType,
      queue,
      queueType,
      keys,
      action,
      options = {},
    } of consumers) {
      // Création auto de l'infra (Exchanges, Queues, Bindings)
      await this.$broker.setupInfrastructure(
        exchange,
        exchangeType,
        queue,
        queueType,
        keys,
      );

      // Lancement de l'écoute
      await this.$broker.consume(
        queue,
        async (msg) => {
          await this[action].call(this, msg);
        },
        keys,
      );
      Logger.log(`Listening: ${queue} (Keys: ${keys.join(', ')})`, 'Broker');
    }
  }
}
