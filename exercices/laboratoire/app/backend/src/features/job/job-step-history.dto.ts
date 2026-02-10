import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Create Job Step History
export const CreateJobStepHistorySchema = z.object({
  job_id: z.string(),
  step_id: z.string().nullable(),
  worker_id: z.string(),
  workflowName: z.string(),
  pluginName: z.string().nullable(),
  status: z.enum(['EXECUTING', 'SUCCESS', 'FAILED']),
  data: z.any().optional(),
});
export class CreateJobStepHistoryDto extends createZodDto(
  CreateJobStepHistorySchema,
) {
  // TODO: do it @ v2
  /*toEntity() {
    return {
      job_id: this.job_id,
      step_id: this.step_id,
      worker_id: this.worker_id,
      executionDate: new Date(),
      executionStatus: this.status,
    } as JobStepHistory;
  }*/
}
export type CreateJobStepHistoryInput = z.infer<
  typeof CreateJobStepHistorySchema
>;

// Update Job Step History
export const UpdateJobStepHistorySchema = CreateJobStepHistorySchema.partial();
export type UpdateJobStepHistoryInput = z.infer<
  typeof UpdateJobStepHistorySchema
>;
