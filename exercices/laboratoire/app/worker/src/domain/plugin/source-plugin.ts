import { BasePlugin } from './base-plugin';

export interface SourcePlugin<T> extends BasePlugin<T> {
  extract(workflow_name: string, job_id: any, step_id: any): Promise<any[]>;
}
