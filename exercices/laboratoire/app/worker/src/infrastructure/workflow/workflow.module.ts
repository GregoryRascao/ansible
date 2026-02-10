import { Module } from '@nestjs/common';
import { JobModule } from '../job/job.module';
import { WorkflowService } from './workflow.service';
import { BrokerService } from '../broker/services/broker.service';

@Module({
  imports: [JobModule],
  controllers: [],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {
  constructor(private readonly $broker: BrokerService) {}
}
