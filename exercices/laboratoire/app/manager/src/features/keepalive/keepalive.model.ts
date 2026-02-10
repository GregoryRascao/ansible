import { z } from 'zod';

export const KeepAliveRequestSchema = z.object({
  worker_id: z.string(),
});
