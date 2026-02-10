import { Global, Inject, Injectable, Logger } from '@nestjs/common';
import amqp, { connect } from 'amqplib';

import {
  BrokerModuleOptions,
  BrokerModuleOptionsToken,
} from '../definitions/broker.definition';

export type ExchangeType = 'direct' | 'topic' | 'headers' | 'fanout' | 'match';

export type ParseConsumeMessage = amqp.ConsumeMessage & { parse: any };

@Global()
@Injectable()
export class BrokerService {
  private channel: amqp.Channel;
  private connection: amqp.ChannelModel;

  constructor(
    @Inject(BrokerModuleOptionsToken) private $options: BrokerModuleOptions,
  ) {
    this.createChannel()
      .then(() =>
        Logger.log('Connection to broker success', BrokerService.name),
      )
      .catch(() =>
        Logger.error('Connection to broker failed', BrokerService.name),
      );
  }

  get Channel() {
    return this.channel;
  }

  async createChannel() {
    this.connection = await connect(
      `amqp://${this.$options.username}:${this.$options.password}@${this.$options.uri}:5672`,
    );
    this.channel = await this.connection.createChannel();

    if (this.$options.exchange) {
      const { name, type } = this.$options.exchange;
      await this.createExchange(name, type);
    }
  }

  async createExchange(name: string, type: ExchangeType) {
    await this.channel.assertExchange(name, type, { durable: true });
  }

  async createQueue(
    exchange: string,
    name: string,
    pattern: string = '*',
    options: Partial<amqp.Options.AssertQueue> = {},
  ) {
    await this.channel.assertQueue(name, {
      ...options,
      durable: true,
    });
    await this.channel.bindQueue(name, exchange, pattern);
  }

  async consume(
    queue: string,
    action: (msg: ParseConsumeMessage, channel: amqp.Channel) => void,
    consumerOptions: Partial<amqp.Options.Consume> = {},
  ) {
    return this.channel.consume(
      queue,
      (msg) => {
        if (msg) {
          action(
            { ...msg, parse: JSON.parse(msg.content.toString('utf-8')) },
            this.channel,
          );
        }
      },
      {
        ...consumerOptions,
      },
    );
  }

  publish(
    exchange: string,
    routingKey: string,
    content: Record<string, any>,
    options: Partial<amqp.Options.Publish> = {},
  ) {
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(content)),
      { ...options, contentType: 'application/json', timestamp: Date.now() },
    );
  }
}
