import { Injectable } from '@nestjs/common';
import { isArray } from 'class-validator';

import * as JsonPath from 'jsonpath';
import { TransformPlugin } from '../../../../domain/plugin/transform-plugin';
import { z, ZodType } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';

export const JsonUnwindFieldSchema = z.object({
  field: z.string().nullable().optional(),
});
export const JsonUnwindSchema = z.object({
  fields: z.array(JsonUnwindFieldSchema).optional(),
});

export const JsonUnwindPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration JSON Unwind
Déplie un tableau contenu dans un objet JSON pour créer plusieurs objets (similaire à $unwind de MongoDB).

**Paramètres :**
- **Fields** : Liste des champs (via JSONPath) à déplier.`,
  fields: [
    {
      name: 'fields',
      label: 'Fields',
      controlType: 'array',
      group: {
        inLine: true,
        fields: [
          {
            name: 'field',
            label: 'Field',
            controlType: 'control',
            formType: 'input',
            inputType: 'text',
            optional: true,
            validators: [],
          },
        ],
        optional: true,
        validators: [],
      },
    },
  ],
  validators: [],
};

export type JsonUnwindTransformerPluginConfig = z.infer<
  typeof JsonUnwindSchema
>;

@Injectable()
export class JsonUnwindTransformerPluginService
  implements TransformPlugin<JsonUnwindTransformerPluginConfig>
{
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'json-unwind-transformer',
      type: 'transform',
      formDefinition: JsonUnwindPluginFormDefinition,
    };
  }
  getSchema(): ZodType {
    return JsonUnwindSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }
  private $config: JsonUnwindTransformerPluginConfig;

  initialize(config: JsonUnwindTransformerPluginConfig): void {
    const parseResult = this.getSchema().safeParse(config);
    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.$config = parseResult.data as JsonUnwindTransformerPluginConfig;
  }

  transform(
    workflow_name: string,
    job_id: any,
    step_id: any,
    data: any[],
  ): Promise<any[]> {
    const transformed = [] as any[];

    if (!this.$config) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'JsonUnwind configuration not provided.',
      );
    }
    if (data.length == 0) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'No data to unwind.',
      );
    }

    const { fields } = this.$config;

    for (const item of data) {
      if (isArray(item)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        transformed.push(...item);
      } else if (!fields || fields.length === 0) {
        transformed.push(item);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        transformed.push(...this.unwind(item));
      }
    }

    return Promise.resolve(transformed);
  }

  private unwind(item: any): any[] {
    const { fields } = this.$config;

    if (!fields || fields.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return [item];
    }

    const fieldToUnwind = fields.find((f) => f.field) || fields[0];
    const value = JsonPath.value(item, fieldToUnwind.field!);

    if (!isArray(value)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return [item];
    }

    return value.map((_, index) => {
      const result = { ...item };

      fields.forEach((group) => {
        if (group.field) {
          const originValues = JsonPath.value(item, group.field);
          if (isArray(originValues)) {
            result[group.field.replace('$.', '')] = {
              index,
              value: originValues[index],
            };
          }
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    });
  }
}
