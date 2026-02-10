import {
  AbstractWorkflowStepHandler,
  WorkflowContext,
} from './workflow-step.handler';
import { JobDestinationResponse } from '../../../domain/job/destination.model';

export class DestinationStepHandler extends AbstractWorkflowStepHandler {
  protected async process(context: WorkflowContext): Promise<void> {
    const { workflow, workingData } = context;

    const destinationResults: JobDestinationResponse[] = await Promise.all(
      workflow.destinations.map(async (destination) => {
        await this.notifyObservers(
          context,
          'EXECUTING',
          destination.step_id,
          destination.name,
        );
        const values = await this.pluginProvider.executeDestination(
          workflow.name,
          workflow.job_id,
          destination,
          workingData,
        );
        const data = {
          job_id: workflow.job_id,
          step_id: destination.step_id,
          plugin: destination.name,
          values,
        };
        await this.notifyObservers(
          context,
          'SUCCESS',
          destination.step_id,
          destination.name,
          data.values?.length || 0,
        );
        return data;
      }),
    );

    context.destinationResults = destinationResults;
  }
}
