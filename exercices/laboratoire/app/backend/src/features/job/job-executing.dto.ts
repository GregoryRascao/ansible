import { WorkflowExecutionStatusEnum } from '@database/schemas/workflow.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateJobExecutingSchema = z.object({
  job_id: z.string(),
  workflow_id: z.string(),
  workflowName: z.string().optional(),
  status: z.enum(WorkflowExecutionStatusEnum),
  worker_id: z.string(),

  // startedAt: z.string(),
  // finishedAt: z.string().nullable(),

  // TODO: FIX: validation date not working
  startedAt: z.string(),
  /*.refine(
      (value) => !isNaN(Date.parse(value)),
      'Invalid date format, must be ISO string',
    )
    .transform((value) => new Date(value))*/

  // TODO: FIX: validation date not working
  finishedAt: z
    .string()
    /*.optional()
    .refine(
      (value) => !value || !isNaN(Date.parse(value)),
      'Invalid date format, must be ISO string',
    )
    .transform((value) => (value ? new Date(value) : undefined))*/
    .nullable(),
});
export class CreateJobExecutingDto extends createZodDto(
  CreateJobExecutingSchema,
) {}
