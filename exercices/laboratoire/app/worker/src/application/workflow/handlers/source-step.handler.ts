import {
  AbstractWorkflowStepHandler,
  WorkflowContext,
} from './workflow-step.handler';
import { JobSourceResponse } from '../../../domain/job/source.model';

export class SourceStepHandler extends AbstractWorkflowStepHandler {
  protected async process(context: WorkflowContext): Promise<void> {
    const { workflow } = context;

    const extractedData: JobSourceResponse[] = await Promise.all(
      workflow.sources.map(async (source) => {
        await this.notifyObservers(
          context,
          'EXECUTING',
          source.step_id,
          source.name,
        );
        const values = await this.pluginProvider.executeSource(
          workflow.name,
          workflow.job_id,
          source,
        );
        const data = {
          job_id: workflow.job_id,
          step_id: source.step_id,
          plugin: source.name,
          values,
        };
        await this.notifyObservers(
          context,
          'SUCCESS',
          source.step_id,
          source.name,
          data.values.length,
        );
        return data;
      }),
    );

    context.extractedData = extractedData;
    context.workingData = extractedData.flatMap((d) => d.values);
  }
}
