import { PluginTypeEnum } from '@database/schemas/plugin.schema';
import { WorkflowExecutionStatusEnum } from '@database/schemas/workflow.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Auditing settings
export const WorkflowAuditingSchema = z.object({
  active: z.boolean(),
  archived: z.boolean(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z
    .string()
    .transform((value) => new Date(value))
    .optional(),
  updatedAt: z
    .string()
    .transform((value) => new Date(value))
    .optional(),
});

// Step Definition
export const WorkflowStepSchema = z.object({
  id: z.string().optional(),
  pluginName: z.string(),
  pluginType: z.enum(PluginTypeEnum),
  values: z.any(),
});

// Workflow Metadata
export const WorkflowMetadataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  cronExpression: z.string().optional(),
  folder: z.string(),
  // TODO: FIX: validation not working
  lastExecutionDate: z
    .string()
    .optional()
    .refine(
      (value) => !value || !isNaN(Date.parse(value)),
      'Invalid date format, must be ISO string',
    )
    .transform((value) => (value ? new Date(value) : undefined)),
  lastExecutionStatus: z.enum(WorkflowExecutionStatusEnum).optional(),
  nbJobInFailedStatus: z.number().optional(),
});

// Create Workflow
export const CreateWorkflowSchema = z.object({
  metadata: WorkflowMetadataSchema,
  steps: z.array(WorkflowStepSchema),
  auditing: WorkflowAuditingSchema,
  running: z.boolean().optional(),
});
export class CreateWorkflowDto extends createZodDto(CreateWorkflowSchema) {}

// Update Workflow Dto
/*export const WorkflowAuditingUpdateSchema = WorkflowAuditingSchema.partial({
  updatedBy: true,
});
// export const UpdateWorkflowSchema = CreateWorkflowSchema.extend({
export const UpdateWorkflowSchema = z.object({
  metadata: WorkflowMetadataSchema,
  steps: z.array(WorkflowStepSchema),
  auditing: WorkflowAuditingUpdateSchema,
});
export class UpdateWorkflowDto extends createZodDto(UpdateWorkflowSchema) {}*/
export class UpdateWorkflowDto extends createZodDto(CreateWorkflowSchema) {}

// Query params Workflow
export const QueryWorkflowSchema = z.object({
  archived: z
    .string()
    .trim()
    .toLowerCase()
    .transform((value) => value === 'true' || value === '1')
    .optional(),
});
export class QueryWorkflowDto extends createZodDto(QueryWorkflowSchema) {}

// Body params Workflow
export const BodyWorkflowSchema = z.object({
  archived: z.boolean(),
});
export class BodyWorkflowDto extends createZodDto(BodyWorkflowSchema) {}
