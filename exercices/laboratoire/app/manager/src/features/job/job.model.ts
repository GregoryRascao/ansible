import z from 'zod';

export const JobStepSchema = z.object({
  step_id: z.string(),
  name: z.string(),
  options: z.any(),
});

export const JobSchema = z.object({
  job_id: z.string(),
  name: z.string(),
  sources: z.array(JobStepSchema),
  transforms: z.array(JobStepSchema),
  destinations: z.array(JobStepSchema),
});

export type Job = z.infer<typeof JobSchema>;

export const JobExecutingStatus = z.enum([
  'PENDING',
  'EXECUTING',
  'SUCCESS',
  'FAILED',
]);
export const JobExecutingSchema = z.object({
  job_id: z.string(),
  worker_id: z.string(),
  workflowName: z.string(),
  step_id: z.string().or(z.null()),
  pluginName: z.string().or(z.null()),
  status: JobExecutingStatus,
  data: z.any().optional(),
});

export type JobExecuting = z.infer<typeof JobExecutingSchema>;
