import { BasePlugin } from './base-plugin';

export interface DestinationPlugin<T> extends BasePlugin<T> {
  publish(
    workflow_name: string,
    job_id: any,
    step_id: any,
    data: any[],
  ): Promise<any>;
}
