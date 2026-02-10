import { JobSourceSchema } from './source.schema';
import { z } from 'zod';

export type JobSource = z.infer<typeof JobSourceSchema>;
export type JobSourceExtracted = {
  job_id: any;
  step_id: any;
  plugin: string;
  values: any[];
};

export type JobSourceResponse = JobSourceExtracted;
