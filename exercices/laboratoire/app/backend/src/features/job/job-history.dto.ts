import { JobExecutionStatusEnum } from '@database/schemas/job-history.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod'; // Create Job

// Create Job History
export const CreateJobHistorySchema = z.object({
  job_id: z.string(),
  worker_id: z.string().optional(),
  workflow_id: z.string(),
  status: z.enum(JobExecutionStatusEnum),
  acknowledged: z.boolean(),
});
export class CreateJobHistoryDto extends createZodDto(CreateJobHistorySchema) {}

// Update Job
export const UpdateJobHistorySchema = CreateJobHistorySchema.partial();
export class UpdateJobHistoryDto extends createZodDto(UpdateJobHistorySchema) {
  // TODO: do it @ v2
  /*toEntity() {
    return {
      job_id: this.job_id,
      worker_id: this.worker_id,
      status: this.status,
      workflowName: this.workflowName,
      acknowledged: this.acknowledged,
    } as JobHistory;
  }*/
}

// Query params Job History
export const QueryJobHistorySchema = z.object({
  workflow_id: z.string().optional(),
  workflowName: z.string().optional(),
  // TODO: FIX: validation of date not working
  startAt: z
    .string()
    .optional()
    .refine(
      (value) => !value || !isNaN(Date.parse(value)),
      'Invalid date format, must be ISO string',
    )
    .transform((value) => (value ? new Date(value) : undefined))
    .optional(), // YYYY-MM-DDTHH:mm:ss.sssZ

  // TODO: FIX: validation of date not working
  endAt: z
    .string()
    .optional()
    .refine(
      (value) => !value || !isNaN(Date.parse(value)),
      'Invalid date format, must be ISO string',
    )
    .transform((value) => (value ? new Date(value) : undefined))
    .optional(), // YYYY-MM-DDTHH:mm:ss.sssZ
  acknowledged: z
    .string()
    .trim()
    .toLowerCase()
    .transform((value) => value === 'true' || value === '1')
    .optional(),
});
export class QueryJobHistoryDto extends createZodDto(QueryJobHistorySchema) {}
