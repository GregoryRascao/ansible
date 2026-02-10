import { z } from 'zod';

export const JobSourceSchema = z.object({
  step_id: z.uuidv4(),
  name: z.string(),
  options: z.any(),
});
