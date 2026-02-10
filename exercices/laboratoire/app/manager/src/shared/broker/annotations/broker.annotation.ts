// broker/annotations/broker.annotation.ts
import amqp from 'amqplib';
// broker/services/broker-consumer.service.ts

export const BrokerConsume = (
  exchange: string,
  exchangeType: 'direct' | 'fanout' | 'topic' = 'topic',
  queue: string,
  queueType: 'quorum' | 'direct' = 'quorum',
  keys: string[] = [],
  options: Partial<amqp.Options.Consume> = {},
): MethodDecorator => {
  return (target, propertyKey) => {
    const consumers =
      Reflect.getMetadata('consumers', target.constructor) || [];
    consumers.push({
      exchange,
      exchangeType,
      queue,
      queueType,
      keys,
      options,
      action: propertyKey,
    });
    Reflect.defineMetadata('consumers', consumers, target.constructor);
  };
};
