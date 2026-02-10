import { z } from 'zod';

export const JobTransformSourceSchema = z.object({
  source: z.string(),
  values: z.array(z.any()),
});
export const JobTransformSourcesSchema = z.array(JobTransformSourceSchema);

export type JobTransformSource = z.infer<typeof JobTransformSourceSchema>;
export type JobTransformSources = z.infer<typeof JobTransformSourcesSchema>;
// export type JobTransform = z.infer<typeof JobTransformSchema>;
export type JobTransformResponse = {
  job_id: any;
  step_id: any;
  plugin: string;
  values: any[];
};
export type JobTransform = { step_id: string; name: string; options: any };
