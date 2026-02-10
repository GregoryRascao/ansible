import amqp from 'amqplib';
import { BrokerService } from './broker.service';

export abstract class BrokerConsumerService {
  constructor(protected readonly $broker: BrokerService) {}

  protected initConsumer() {
    setTimeout(() => {
      const consumers = Reflect.getMetadata('consumers', this.constructor) as {
        queue: string;
        options: amqp.Options.Consume;
        action: string;
      }[];
      consumers.forEach(({ queue, options, action }) =>
        this.$broker.consume(queue, this[action], options),
      );
    }, 2000);
  }
}
