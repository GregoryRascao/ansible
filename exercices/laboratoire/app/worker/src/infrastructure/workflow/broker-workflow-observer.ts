import { IBrokerPort } from '../../application/ports/ports';
import {
  IWorkflowObserver,
  WorkflowUpdate,
} from '../../application/workflow/workflow-observer.interface';

export class BrokerWorkflowObserver implements IWorkflowObserver {
  constructor(private readonly broker: IBrokerPort) {}

  public async update(event: WorkflowUpdate): Promise<void> {
    const msg = {
      job_id: event.job_id,
      worker_id: process.env.WORKER_ID,
      workflowName: event.workflow_name,
      step_id: event.stepId,
      pluginName: event.pluginName,
      status: event.status,
    } as Record<string, any>;

    if (event.data) {
      msg.data = event.data;
    }

    await this.broker.publish('job', 'waves.job.update', msg);
  }
}
