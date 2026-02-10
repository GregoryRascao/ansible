import { Global, Inject, Injectable, Logger } from '@nestjs/common';
import amqp, { Channel, connect } from 'amqplib';
import {
  BrokerModuleOptions,
  BrokerModuleOptionsToken,
  ExchangeType,
} from '../definitions/broker.definition';

export type ParseConsumeMessage = amqp.ConsumeMessage & { parse: any };

@Global()
@Injectable()
export class BrokerService {
  private connection: amqp.ChannelModel | null = null;
  private publishChannel: amqp.Channel;
  private reconnectListeners: Array<() => Promise<void>> = [];
  private connectingPromise: Promise<void> | null = null;

  constructor(
    @Inject(BrokerModuleOptionsToken) private $options: BrokerModuleOptions,
  ) {}

  async connect() {
    if (this.connectingPromise) return this.connectingPromise;

    this.connectingPromise = (async () => {
      const {
        protocol = 'amqp',
        uri,
        port,
        username,
        password,
        vhost = '/',
      } = this.$options;
      try {
        this.connection = await connect({
          protocol,
          hostname: uri,
          port: port || (protocol === 'amqps' ? 5671 : 5672),
          username,
          password,
          vhost,
          heartbeat: 60,
        });

        this.connection.on('error', (err) =>
          Logger.error('Connection Error', err.message),
        );
        this.connection.on('close', () => {
          this.connection = null;
          this.connectingPromise = null;
          this.handleReconnect();
        });

        this.publishChannel = await this.connection.createChannel();
        Logger.log('Connected to RabbitMQ', BrokerService.name);
      } catch (error) {
        this.connectingPromise = null;
        throw error;
      }
    })();
    return this.connectingPromise;
  }

  async ensureConnection() {
    if (!this.connection) await this.connect();
  }

  async setupInfrastructure(
    exchange: string,
    type: ExchangeType,
    queue: string,
    queueType: 'quorum' | 'direct' = 'quorum',
    routingKeys: string[],
  ) {
    await this.ensureConnection();
    const channel = await this.connection!.createChannel();

    // Éviter que l'erreur 406 ne tue le processus
    channel.on('error', (err) => {
      Logger.error(
        `Channel Error (Infra): ${err.message}. Hint: If 406, delete the queue '${queue}' in RabbitMQ.`,
      );
    });

    try {
      await channel.assertExchange(exchange, type, {
        durable: true,
        arguments: { 'x-queue-type': queueType },
      });

      // const dlx = `${exchange}.dlx`;
      // const dlq = `${queue}.dlq`;
      // await channel.assertExchange(dlx, 'direct', { durable: true });
      // await channel.assertQueue(dlq, { durable: true });
      // await channel.bindQueue(dlq, dlx, 'dead-letter');
      //
      // // C'est ici que l'erreur 406 se produit si la queue existe déjà sans DLX
      // await channel.assertQueue(queue, {
      //   durable: true,
      //   arguments: {
      //     'x-dead-letter-exchange': dlx,
      //     'x-dead-letter-routing-key': 'dead-letter',
      //     'x-queue-type': 'quorum',
      //   },
      // });

      await channel.assertQueue(queue, { durable: true });

      for (const key of routingKeys) {
        await channel.bindQueue(queue, exchange, key);
      }
    } finally {
      await channel.close().catch(() => {});
    }
  }

  async consume(
    queue: string,
    action: (msg: any, channel: Channel) => Promise<void>,
    routingKeys: string[] = [],
  ) {
    await this.ensureConnection();
    const channel = await this.connection!.createChannel();
    channel.on('error', (err) =>
      Logger.error(`Channel Error (Consume): ${err.message}`),
    );

    await channel.prefetch(1);
    await channel.consume(queue, async (msg) => {
      if (!msg) {
        channel.nackAll();
        return;
      }
      channel.ack(msg);

      const routingKey = msg.fields.routingKey;

      if (routingKeys.length > 0 && !routingKeys.includes(routingKey)) {
        return;
      }

      try {
        Logger.log(
          `Received message on ${routingKey} with content: ${msg.content.toString()}`,
          BrokerService.name,
        );
        const parse = JSON.parse(msg.content.toString());
        Logger.log(parse, BrokerService.name);
        await action({ ...msg, parse }, channel);
      } catch (e) {
        Logger.error(`Business Logic Error: ${e.message}`);
      }
    });
  }

  async publish(exchange: string, routingKey: string, content: any) {
    await this.ensureConnection();
    this.publishChannel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(content)),
      { persistent: true },
    );
  }

  onReconnect(listener: () => void) {
    this.reconnectListeners.push(async () => listener());
  }

  private handleReconnect() {
    setTimeout(async () => {
      try {
        await this.connect();
        for (const l of this.reconnectListeners) await l();
      } catch (e) {
        this.handleReconnect();
      }
    }, 5000);
  }
}
