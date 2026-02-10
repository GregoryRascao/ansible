import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WorkerDocument = Worker & Document;

@Schema({
  collection: 'workers',
  timestamps: true,
})
export class Worker {
  @Prop({ required: true, unique: true })
  worker_id: string;

  @Prop()
  state?: string;
}
export const WorkerSchema = SchemaFactory.createForClass(Worker);
