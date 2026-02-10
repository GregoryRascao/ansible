import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { JobModule } from './infrastructure/job/job.module';
import { PluginModule } from './infrastructure/plugin/plugin.module';
import { v4 as uuidv4 } from 'uuid';
import { WorkflowModule } from './infrastructure/workflow/workflow.module';
import { BrokerModule } from './infrastructure/broker/broker.module';
import { BrokerService } from './infrastructure/broker/services/broker.service';
import { PluginRegistry } from './infrastructure/plugin/plugin.registry';
import { KeepaliveModule } from './infrastructure/keepalive/keepalive.module';
import { ScheduleModule } from '@nestjs/schedule';

export const worker_id = process.env.WORKER_ID || uuidv4();

process.env.WORKER_ID = worker_id;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    WorkflowModule,
    JobModule,
    PluginModule,
    BrokerModule.register({
      uri: '51.68.225.136',
      username: 'waves',
      password: 'Test1234=',
      vhost: 'waves',
    }),
    KeepaliveModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly $broker: BrokerService,
    private readonly $plugin: PluginRegistry,
  ) {}
  onModuleInit() {
    setTimeout(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      () =>
        this.init().then(() => {
          Logger.log('Worker initialized', AppModule.name);
        }),
      1000,
    );
  }

  private async init() {
    // await this.$broker.createExchange('job', 'topic');
    // await this.$broker.createExchange('error', 'fanout');
    // await this.$broker.createExchange('plugin', 'fanout');
    // await this.$broker.createExchange('system', 'fanout');
    //
    // await this.$broker.createQueue('__heartbeat__', {
    //   arguments: {
    //     'x-queue-type': 'quorum',
    //   },
    // });
    // await this.$broker.createQueue(`waves-worker`, {
    //   arguments: {
    //     'x-queue-type': 'quorum',
    //   },
    //   durable: true,
    // });
    //
    // await this.$broker.bindQueue('job', `waves-worker`, 'waves.job.start');

    Logger.log('Worker registered', AppModule.name);
    await this.$broker.publish('system', 'waves.worker.init', {
      worker_id: process.env.WORKER_ID,
    });

    Logger.log('Worker sending plugins', AppModule.name);
    const plugins = await this.$plugin.autoRegisterPlugins();

    await this.$broker.publish('plugin', 'waves.plugin.register', {
      plugins,
      date: new Date(),
    });
  }
}
