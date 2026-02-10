import { z } from 'zod';
import { PluginType } from '@features/plugin/plugin.model';
import { createZodDto } from 'nestjs-zod';

export const WorkflowRequestStepSchema = z.object({
  pluginName: z.string(),
  pluginType: PluginType,
  values: z.any(),
});

export const WorkflowRequestMetadata = z.object({
  name: z.string(),
  folder: z.string().optional().optional(),
  description: z.string().optional(),
  cronExpression: z.string(),
  lastExecutionDate: z.string().optional(),
  lastExecutionStatus: z.enum(['SUCCESS', 'TIMEOUT', 'ERROR']).optional(),
  nbJobInFailedStatus: z.number().optional(),
});

export const WorkflowRequestSchema = z.object({
  id: z.string().or(z.number()),
  metadata: WorkflowRequestMetadata,
  steps: z.array(WorkflowRequestStepSchema),
});

export class WorkflowStartRequest extends createZodDto(WorkflowRequestSchema) {}

export type Workflow = z.infer<typeof WorkflowRequestSchema>;
