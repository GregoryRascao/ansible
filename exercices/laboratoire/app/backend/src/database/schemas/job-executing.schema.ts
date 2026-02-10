import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  WorkflowExecutionStatus,
  WorkflowExecutionStatusEnum,
} from './workflow.schema';

export type JobExecutingDocument = JobExecuting & Document;

@Schema({
  collection: 'jobs_executing',
  timestamps: true,
})
export class JobExecuting {
  @Prop({ required: true })
  job_id: string;

  @Prop({ required: true })
  workflow_id: string;

  @Prop({
    type: String,
    enum: WorkflowExecutionStatusEnum,
    required: true,
  })
  status: WorkflowExecutionStatus;

  @Prop()
  worker_id?: string;

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop({ type: Date })
  finishedAt?: Date;
}
export const JobExecutingSchema = SchemaFactory.createForClass(JobExecuting);
