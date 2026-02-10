import { BasePlugin } from './base-plugin';

export interface TransformPlugin<T> extends BasePlugin<T> {
  transform(
    workflow_name: string,
    job_id: any,
    step_id: any,
    data: any[],
  ): Promise<any>;
}
