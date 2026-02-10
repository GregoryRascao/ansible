import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BrokerService } from '../broker/services/broker.service';

@Injectable()
export class KeepaliveService {
  constructor(private readonly $broker: BrokerService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const worker_id = process.env.WORKER_ID!;

    await this.$broker.publish('system', 'waves.worker.keepalive', {
      worker_id,
    });
  }
}
