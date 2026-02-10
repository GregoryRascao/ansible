import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Create Worker
export const CreateWorkerSchema = z.object({
  worker_id: z.string(),
  state: z.string().optional(),
});
export class CreateWorkerDto extends createZodDto(CreateWorkerSchema) {}

// Body params Worker
export const BodyWorkerSchema = z.object({
  // TODO: implement more if needed
});
export class BodyWorkerDto extends createZodDto(BodyWorkerSchema) {}
