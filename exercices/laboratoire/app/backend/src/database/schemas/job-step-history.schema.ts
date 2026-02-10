import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  WorkflowExecutionStatus,
  WorkflowExecutionStatusEnum,
} from './workflow.schema';

export type JobStepHistoryDocument = JobStepHistory & Document;

@Schema({
  collection: 'job_steps_history',
  timestamps: true,
})
export class JobStepHistory {
  @Prop({ required: true })
  job_id: string;

  @Prop()
  step_id?: string;

  @Prop()
  worker_id?: string;

  @Prop({ required: true })
  workflow_id: string;

  @Prop()
  pluginName?: string;

  @Prop({ type: String, enum: WorkflowExecutionStatusEnum, required: true })
  executionStatus: WorkflowExecutionStatus;

  @Prop({ type: MongooseSchema.Types.Mixed })
  executionResult?: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  executionError?: any;

  @Prop({ type: Date })
  executionDate?: Date;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  data?: any[];
}

export const JobStepHistorySchema =
  SchemaFactory.createForClass(JobStepHistory);
