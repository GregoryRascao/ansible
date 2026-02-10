import { z } from 'zod';

export const JobTransformSchema = z.object({
  step_id: z.uuidv4(),
  name: z.string(),
  options: z.any(),
});
