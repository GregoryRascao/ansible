import amqp from 'amqplib';

export const BrokerConsume = function (
  queue: string,
  options: Partial<amqp.Options.Consume> = {},
): MethodDecorator {
  return function (target, propertyKey) {
    const consumers = Reflect.getMetadata(
      'consumers',
      target.constructor,
    ) as any[];
    if (!consumers) {
      Reflect.defineMetadata(
        'consumers',
        [{ queue, options, action: propertyKey }] as any[],
        target.constructor,
      );
    } else {
      consumers.push({ queue, options, action: propertyKey });
      Reflect.defineMetadata('consumers', consumers, target.constructor);
    }
  };
};
