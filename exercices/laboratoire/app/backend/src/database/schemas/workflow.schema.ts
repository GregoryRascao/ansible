import { PluginType, PluginTypeEnum } from '@database/schemas/plugin.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WorkflowDocument = Workflow & Document;

export type WorkflowExecutionStatus =
  | 'SUCCESS'
  | 'PENDING'
  | 'EXECUTING'
  | 'FAILED';
export const WorkflowExecutionStatusEnum = [
  'SUCCESS',
  'PENDING',
  'EXECUTING',
  'FAILED',
] as const;

// *************************** WorkflowAuditing **********************************
@Schema({ _id: false, timestamps: true })
export class WorkflowAuditing {
  @Prop({ required: true, default: true })
  active: boolean;

  @Prop({ required: true, default: false })
  archived: boolean;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  updatedBy: string;
}
export const WorkflowAuditingSchema =
  SchemaFactory.createForClass(WorkflowAuditing);

// *************************** WorkflowStep *************************************
@Schema({ _id: false })
export class WorkflowStep {
  @Prop({ required: true })
  pluginName: string;

  @Prop({ type: String, enum: PluginTypeEnum, required: true })
  pluginType: PluginType;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  values: any;
}
export const WorkflowStepSchema = SchemaFactory.createForClass(WorkflowStep);

// ************************* WorkflowMetadata ***********************************
@Schema({ _id: false })
export class WorkflowMetadata {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  cronExpression?: string;

  @Prop()
  folder?: string;

  @Prop()
  lastExecutionDate?: Date;

  @Prop({ type: String, enum: WorkflowExecutionStatusEnum })
  lastExecutionStatus?: WorkflowExecutionStatus;

  @Prop()
  nbJobInFailedStatus?: number;
}
export const WorkflowMetadataSchema =
  SchemaFactory.createForClass(WorkflowMetadata);

// ****************************** Workflow ***************************************
@Schema({
  collection: 'workflows',
})
export class Workflow {
  @Prop({ type: WorkflowMetadataSchema, required: true })
  metadata: WorkflowMetadata;

  @Prop({ type: [WorkflowStepSchema], required: true })
  steps: WorkflowStep[];

  @Prop({ type: WorkflowAuditingSchema, required: true })
  auditing: WorkflowAuditing;

  @Prop({ default: false })
  running?: boolean;
}
export const WorkflowSchema = SchemaFactory.createForClass(Workflow);
