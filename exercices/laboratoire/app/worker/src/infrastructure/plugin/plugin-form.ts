import { z } from 'zod';

export const PluginType = z.enum(['source', 'transform', 'destination']);

export const PluginFormValidatorSchema = z.object({
  name: z.string(),
  params: z.any().optional(),
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

export const PluginFormDefinitionSchema = z.object({
  inLine: z.boolean().optional().default(false),
  fields: z.array(PluginFormFieldDefinitionSchema),
  validators: z.array(PluginFormValidatorSchema),
  contextualHelper: z.string().optional(),
});

export const PluginTypeSchema = z.enum([
  'metadata',
  'source',
  'transform',
  'destination',
  'resume',
]);

export const PluginSchema = z.object({
  name: z.string(),
  type: PluginTypeSchema,
  formDefinition: PluginFormDefinitionSchema,
});

// Type exports
export type PluginFormValidator = z.infer<typeof PluginFormValidatorSchema>;
export type PluginFormFieldInputType = z.infer<
  typeof PluginFormFieldInputTypeSchema
>;
export type PluginFormFieldFormType = z.infer<
  typeof PluginFormFieldFormTypeSchema
>;
export type PluginFormFieldControlType = z.infer<
  typeof PluginFormFieldControlTypeSchema
>;
export type PluginFormFieldDefinition = z.infer<
  typeof PluginFormFieldDefinitionSchema
>;
export type PluginFormDefinition = z.infer<typeof PluginFormDefinitionSchema>;
export type PluginType = z.infer<typeof PluginTypeSchema>;
export type Plugin = z.infer<typeof PluginSchema>;
