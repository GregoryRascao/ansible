import { Injectable, Logger } from '@nestjs/common';
import { BrokerConsumerService } from '@shared/broker/services/broker-consumer.service';
import {
  BrokerService,
  ParseConsumeMessage,
} from '@shared/broker/services/broker.service';
import { BrokerConsume } from '@shared/broker/annotations/broker.annotation';
import { PluginInitSchema } from '@features/plugin/plugin.model';
import { ZodError } from 'zod';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { EnvService } from '@config/env/env.service';

@Injectable()
export class PluginService extends BrokerConsumerService {
  constructor(
    $broker: BrokerService,
    private readonly $http: HttpService,
    private readonly $env: EnvService,
  ) {
    super($broker);
  }

  @BrokerConsume('plugin', 'fanout', 'waves-manager-plugin', 'quorum', [
    'waves.plugin.register',
  ])
  async handlePlugin(message: ParseConsumeMessage) {
    try {
      const data = message.parse;
      Logger.log(data, PluginService.name);
      const content = PluginInitSchema.parse(data);
      const apiCalls = [] as Array<Promise<any>>;
      for (const plugin of content.plugins) {
        apiCalls.push(
          lastValueFrom(
            this.$http.put(
              `${this.$env.get('WAVES_BACK')}/plugins/${plugin.name}`,
              plugin,
            ),
          ),
        );
      }

      await Promise.all(apiCalls);
    } catch (e) {
      if (e instanceof ZodError) {
        Logger.error(e.message, PluginService.name);
      }
    }
  }
}
