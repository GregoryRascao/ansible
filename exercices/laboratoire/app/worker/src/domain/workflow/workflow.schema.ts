import { z } from 'zod';
import { JobDestinationSchema } from '../job/destination.schema';
import { JobSourceSchema } from '../job/source.schema';
import { JobTransformSchema } from '../job/transform.schema';

export const WorkflowSchema = z.object({
  job_id: z.uuidv4(),
  name: z.string(),
  sources: z.array(JobSourceSchema),
  transforms: z.array(JobTransformSchema),
  destinations: z.array(JobDestinationSchema),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
