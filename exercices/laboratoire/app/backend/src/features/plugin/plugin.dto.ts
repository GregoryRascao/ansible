import { PluginTypeEnum } from '@database/schemas/plugin.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Form Validator
export const PluginFormValidatorSchema = z.object({
  name: z.string(),
  params: z.any().optional(),
});

// Select value
export const SelectValueSchema = z.object({
  label: z.string(),
  value: z.any().optional(),
});
export const PluginFormFieldInputTypeSchema = z.enum([
  'text',
  'number',
  'date',
  'datetime-local',
  'email',
  'password',
  'tel',
  'url',
  'hidden',
]);

export const PluginFormFieldFormTypeSchema = z.enum([
  'input',
  'select',
  'textarea',
  'checkbox',
  'radio',
]);

export const PluginFormFieldControlTypeSchema = z.enum([
  'control',
  'group',
  'array',
]);
// Form Field Definition
export const PluginFormFieldDefinitionSchema = z.lazy(() =>
  z.object({
    name: z.string(),
    label: z.string(),
    formType: PluginFormFieldFormTypeSchema.optional(),
    controlType: PluginFormFieldControlTypeSchema,
    optional: z.boolean().optional().default(false),
    defaultValue: z.any().optional(),
    validators: z.array(PluginFormValidatorSchema).optional(),
    selectValues: z
      .array(
        z.object({
          label: z.string(),
          value: z.any(),
        }),
      )
      .optional(),
    inputType: PluginFormFieldInputTypeSchema.optional(),
    fields: z.array(PluginFormFieldDefinitionSchema).optional(),
    group: PluginFormDefinitionSchema.optional(),
  }),
);

// Form Definition
export const PluginFormDefinitionSchema = z.object({
  inLine: z.boolean().optional().default(false),
  fields: z.array(PluginFormFieldDefinitionSchema),
  validators: z.array(PluginFormValidatorSchema),
  contextualHelper: z.string().optional(),
});

// Create Plugin
export const CreatePluginSchema = z.object({
  name: z.string(),
  type: z.enum(PluginTypeEnum),
  formDefinition: PluginFormDefinitionSchema,
});
export class CreatePluginDto extends createZodDto(CreatePluginSchema) {}

// Query params Plugin
export const QueryPluginSchema = z.object({
  // type: z.enum(PluginTypeEnum).optional(),
  type: z.string().optional(),
});
export class QueryPluginDto extends createZodDto(QueryPluginSchema) {}
