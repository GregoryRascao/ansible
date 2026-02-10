import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobHistoryDocument = JobHistory & Document;

export type JobExecutionStatus = 'SUCCESS' | 'PENDING' | 'EXECUTING' | 'FAILED';
export const JobExecutionStatusEnum = [
  'SUCCESS',
  'PENDING',
  'EXECUTING',
  'FAILED',
] as const;

@Schema({
  collection: 'jobs_history',
  timestamps: true,
})
export class JobHistory {
  @Prop({ unique: true, required: true })
  job_id: string;

  @Prop()
  worker_id?: string;

  @Prop({ required: true })
  workflow_id: string;

  @Prop({ type: String, enum: JobExecutionStatusEnum, required: true })
  status: JobExecutionStatus;

  @Prop({ type: Boolean, default: false })
  acknowledged: boolean;

  @Prop({ type: Date })
  startAt?: Date;

  @Prop({ type: Date })
  endAt?: Date;
}
export const JobHistorySchema = SchemaFactory.createForClass(JobHistory);
