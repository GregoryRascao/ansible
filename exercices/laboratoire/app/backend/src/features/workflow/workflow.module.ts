import { DatabaseModule } from '@database/database.module';
import { CronModule } from '@features/cron/cron.module';
import { JobModule } from '@features/job/job.module';
import { WorkflowController } from '@features/workflow/workflow.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { forwardRef, Logger, Module, OnModuleInit } from '@nestjs/common';
import { WorkflowSocketService } from './workflow-socket.service';
import { WorkflowGateway } from './workflow.gateway';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [
    HttpModule,
    DatabaseModule,
    forwardRef(() => JobModule),
    CronModule,
    ConfigModule,
  ],
  providers: [WorkflowService, WorkflowGateway, WorkflowSocketService],
  exports: [WorkflowService, WorkflowSocketService, WorkflowGateway],
  controllers: [WorkflowController],
})
export class WorkflowModule implements OnModuleInit {
  constructor(private readonly $workflowService: WorkflowService) {}
  async onModuleInit() {
    await this.$workflowService
      .init()
      .then(() => Logger.log('Workflows initialized', WorkflowModule.name));
  }
}
