import { Injectable, Logger } from '@nestjs/common';
import { BrokerConsumerService } from '@shared/broker/services/broker-consumer.service';
import { BrokerConsume } from '@shared/broker/annotations/broker.annotation';
import {
  BrokerService,
  ParseConsumeMessage,
} from '@shared/broker/services/broker.service';
import { Channel } from 'amqplib';
import { HttpService } from '@nestjs/axios';
import { KeepAliveRequestSchema } from '@features/keepalive/keepalive.model';
import { lastValueFrom } from 'rxjs';
import { intervalToDuration } from 'date-fns';
import { EnvService } from '@config/env/env.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class KeepaliveService extends BrokerConsumerService {
  private workers = new Map<string, Date>();
  private readonly $http = new HttpService();

  constructor(
    private $env: EnvService,
    $broker: BrokerService,
  ) {
    super($broker);
  }

  @BrokerConsume('system', 'fanout', 'waves-manager-keepalive', 'quorum', ['*'])
  async handleKeepalive(message: ParseConsumeMessage, _channel: Channel) {
    try {
      const keepAlive = KeepAliveRequestSchema.parse(message.parse);

      this.workers.set(keepAlive.worker_id, new Date());
    } catch (e) {
      Logger.error(e.message, KeepaliveService.name);
      await this.$broker.publish('error', '', {
        error: e,
        message: 'Error while processing keepalive message',
      });
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkWorkers() {
    // Logger.log('Checking workers are alive', KeepaliveService.name);
    const timeOutWorkers = Array.from(this.workers.entries()).filter(
      ([worker_id, date]) => {
        const diff = intervalToDuration({
          start: date,
          end: new Date(),
        });
        return (
          diff.minutes && diff.minutes > this.$env.get('KEEPALIVE_INTERVAL')
        );
      },
    );
    if (timeOutWorkers.length > 0) {
      Logger.log(
        `There are ${timeOutWorkers.length} workers that are dead`,
        KeepaliveService.name,
      );
      await this.$broker.publish('system', 'waves.worker.dead', {
        message: `There are ${timeOutWorkers.length} workers that are dead`,
        data: {
          workers: timeOutWorkers,
        },
      });
      try {
        await Promise.all(
          Array.from(timeOutWorkers).map(([worker_id, date]) =>
            lastValueFrom(
              this.$http.put(
                `${this.$env.get('WAVES_BACK')}/workers/${worker_id}`,
                {
                  worker_id,
                  last_keepalive: date,
                  status: 'DEAD',
                },
              ),
            ),
          ),
        );
      } catch (e) {
        await this.$broker.publish('error', '', {
          error: e,
          message: 'Error while processing keepalive message',
        });
      }
    }
  }
}
