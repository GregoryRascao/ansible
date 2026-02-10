import { Injectable } from '@nestjs/common';
import { WorkflowGateway } from './workflow.gateway';

@Injectable()
export class WorkflowSocketService {
  constructor(private readonly $gateway: WorkflowGateway) {}

  new(workflow: any) {
    this.$gateway.newEmit(workflow);
  }

  start(workflow: any) {
    this.$gateway.startEmit(workflow);
  }

  stop(workflow: any) {
    this.$gateway.stopEmit(workflow);
  }

  update(workflow: any) {
    this.$gateway.updateEmit(workflow);
  }
  play(workflow: any) {
    this.$gateway.playEmit(workflow);
  }
}
