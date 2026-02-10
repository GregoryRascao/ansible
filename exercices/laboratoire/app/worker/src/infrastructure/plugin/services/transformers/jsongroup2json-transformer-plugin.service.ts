import { Injectable } from '@nestjs/common';
import { Json2jsonTransformerPluginService } from './json2json-transformer-plugin.service';
import { TransformPlugin } from '../../../../domain/plugin/transform-plugin';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { z, ZodType } from 'zod';
import { StepError } from '../../../../domain/plugin/StepError';

export const JsonGroup2jsonMappingRuleSchema = z.object({
  destField: z.string(),
  mappingRule: z.any(),
});

export const JsonGroup2jsonMappingRulesSchema = z.object({
  mappingRule: z.array(JsonGroup2jsonMappingRuleSchema),
});

export const JsonGroup2jsonSchema = z.object({
  dateFormat: z.string().optional(),
  mappingRules: z.array(JsonGroup2jsonMappingRulesSchema),
});
export const JsonGroup2jsonPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration JSON Group to JSON
Applique des règles de mapping sur des données groupées.

**Paramètres :**
- **Date format** : Formatage des dates.
- **Mapping rules** : Liste de règles à appliquer sur chaque groupe.`,
  fields: [
    {
      name: 'dateFormat',
      label: 'Date format',
      formType: 'input',
      controlType: 'control',
      inputType: 'text',
      optional: true,
      validators: [],
    },
    {
      name: 'mappingRules',
      label: 'Mapping rules',
      controlType: 'array',
      optional: false,
      group: {
        fields: [
          {
            name: 'mappingRule',
            label: 'Mapping Rule',
            controlType: 'array',
            optional: false,
            group: {
              fields: [
                {
                  name: 'destField',
                  label: 'Destination fields',
                  controlType: 'control',
                  formType: 'input',
                  inputType: 'text',
                  optional: false,
                  validators: [
                    {
                      name: 'required',
                    },
                  ],
                },
                {
                  name: 'mappingRule',
                  label: 'Mapping rule',
                  controlType: 'control',
                  formType: 'input',
                  inputType: 'text',
                  optional: false,
                  validators: [
                    {
                      name: 'required',
                    },
                  ],
                },
              ],
              validators: [],
            },
          },
        ],
        validators: [],
      },
      validators: [],
    },
  ],
  validators: [],
};
export type JsonGroup2jsonTransformerPluginConfig = z.infer<
  typeof JsonGroup2jsonSchema
>;

@Injectable()
export class JsonGroup2jsonTransformerPluginService
  implements TransformPlugin<JsonGroup2jsonTransformerPluginConfig>
{
  constructor(private readonly $json2json: Json2jsonTransformerPluginService) {}
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'jsongroup2json-transformer',
      type: 'transform',
      formDefinition: JsonGroup2jsonPluginFormDefinition,
    };
  }
  getSchema(): ZodType {
    return JsonGroup2jsonSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }
  protected config: JsonGroup2jsonTransformerPluginConfig;

  initialize(config: JsonGroup2jsonTransformerPluginConfig): void {
    const parseResult = this.getSchema().safeParse(config);
    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.config = parseResult.data as JsonGroup2jsonTransformerPluginConfig;
  }
  transform(
    workflow_name: string,
    job_id: any,
    step_id: any,
    data: any[],
  ): Promise<any[]> {
    if (!this.config) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'JsonGroup2json configuration not provided.',
      );
    }
    if (data.length == 0) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'Data empty',
      );
    }
    const transformedValues = [] as any[];

    for (const item of data) {
      for (const groupMappingRule of this.config.mappingRules) {
        transformedValues.push(
          this.$json2json.transformJson(item, groupMappingRule.mappingRule),
        );
      }
    }

    return Promise.all(transformedValues);
  }
}
