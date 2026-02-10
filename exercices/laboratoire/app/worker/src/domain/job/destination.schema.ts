import { z } from 'zod';

export const JobDestinationSchema = z.object({
  step_id: z.uuidv4(),
  name: z.string(),
  options: z.any(),
});
