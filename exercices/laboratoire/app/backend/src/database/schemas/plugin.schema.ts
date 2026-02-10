import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PluginDocument = Plugin & Document;

export type PluginType =
  | 'metadata'
  | 'source'
  | 'transform'
  | 'destination'
  | 'resume';
export const PluginTypeEnum = [
  'metadata',
  'source',
  'transform',
  'destination',
  'resume',
] as const;

export type PluginFormFieldFormType =
  | 'input'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio';
export const PluginFormFieldFormTypeEnum = [
  'input',
  'select',
  'textarea',
  'checkbox',
  'radio',
] as const;

export type PluginFormFieldControlType = 'control' | 'group' | 'array';
export const PluginFormFieldControlTypeEnum = [
  'control',
  'group',
  'array',
] as const;

export type PluginFormFieldInputType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'hidden';
export const PluginFormFieldInputTypeEnum = [
  'text',
  'number',
  'date',
  'datetime-local',
  'email',
  'password',
  'tel',
  'url',
  'hidden',
] as const;

// ************************* PluginFormDefinition ***********************************
@Schema({ _id: false })
export class PluginFormValidator {
  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  params?: any;
}
export const PluginFormValidatorSchema =
  SchemaFactory.createForClass(PluginFormValidator);

// ************************* selectValue ***********************************
@Schema({ _id: false })
export class SelectValue {
  @Prop({ required: true })
  label: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  value?: any;
}
export const SelectValueSchema = SchemaFactory.createForClass(SelectValue);

// ************************* PluginFormDefinition ***********************************
@Schema({ _id: false })
export class PluginFormFieldDefinition {
  @Prop()
  name: string;

  @Prop()
  label: string;

  @Prop({ type: String, enum: PluginFormFieldFormTypeEnum })
  formType?: PluginFormFieldFormType;

  @Prop({ type: String, enum: PluginFormFieldControlTypeEnum })
  controlType?: PluginFormFieldControlType;

  // Important: avoid reflective self-recursion during SchemaFactory.createForClass
  // The actual recursive shape is appended via schema.add(...) below.
  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  group?: any;

  @Prop({ default: false })
  optional: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed })
  defaultValue?: any;

  @Prop({ type: [PluginFormValidatorSchema], default: [] })
  validators: PluginFormValidator[];

  @Prop({ type: [SelectValueSchema] })
  selectValues?: SelectValue[];

  @Prop({ type: String, enum: PluginFormFieldInputTypeEnum })
  inputType?: PluginFormFieldInputType;
}
export const PluginFormFieldDefinitionSchema = SchemaFactory.createForClass(
  PluginFormFieldDefinition,
);

// ************************* PluginFormDefinition ***********************************
@Schema({ _id: false })
export class PluginFormDefinition {
  @Prop({ type: Boolean, default: false })
  inLine?: boolean;

  @Prop({ type: [PluginFormFieldDefinitionSchema], required: true })
  fields: PluginFormFieldDefinition[];

  @Prop({ type: [PluginFormValidatorSchema], required: true })
  validators: PluginFormValidator[];

  @Prop({ type: String })
  contextualHelper?: string;
}
export const PluginFormDefinitionSchema =
  SchemaFactory.createForClass(PluginFormDefinition);

(PluginFormFieldDefinitionSchema as any).add({
  group: {
    type: PluginFormDefinitionSchema,
    required: false,
  },
  fields: {
    type: [PluginFormFieldDefinitionSchema],
    required: false,
    default: [],
  },
});

// *************************** Plugin **********************************
@Schema({
  timestamps: true,
  collection: 'plugins',
})
export class Plugin {
  // @Prop()
  _id?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: PluginTypeEnum, required: true })
  type: PluginType;

  @Prop({ type: PluginFormDefinitionSchema, required: true })
  formDefinition: PluginFormDefinition;
}
export const PluginSchema = SchemaFactory.createForClass(Plugin);
