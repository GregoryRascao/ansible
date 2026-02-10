import {
  AbstractWorkflowStepHandler,
  WorkflowContext,
} from './workflow-step.handler';
import { JobTransformResponse } from '../../../domain/job/transform.model';

export class TransformStepHandler extends AbstractWorkflowStepHandler {
  protected async process(context: WorkflowContext): Promise<void> {
    const { workflow } = context;
    const transformedData: JobTransformResponse[] = [];

    for (const transform of workflow.transforms) {
      await this.notifyObservers(
        context,
        'EXECUTING',
        transform.step_id,
        transform.name,
      );
      const values = await this.pluginProvider.executeTransform(
        workflow.name,
        workflow.job_id,
        transform,
        context.workingData,
      );
      const data = {
        job_id: workflow.job_id,
        step_id: transform.step_id,
        plugin: transform.name,
        values,
      };
      context.workingData = data.values;
      transformedData.push(data);
      await this.notifyObservers(
        context,
        'SUCCESS',
        transform.step_id,
        transform.name,
        { nbItems: context.workingData.length },
      );
    }

    context.transformedData = transformedData;
  }
}
