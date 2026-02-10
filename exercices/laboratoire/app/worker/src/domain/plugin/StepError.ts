import { JobError } from '../job/JobError';

export class StepError extends JobError {
  constructor(
    job_id: any,
    public workflow_name: string,
    step_id: any,
    public pluginName: string,
    message: string,
  ) {
    super(job_id, step_id, message);
  }
}
