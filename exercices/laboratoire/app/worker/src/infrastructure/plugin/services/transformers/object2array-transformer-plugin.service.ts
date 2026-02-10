import { Injectable } from '@nestjs/common';
import { isObject } from 'class-validator';

import * as JsonPath from 'jsonpath';
import { TransformPlugin } from '../../../../domain/plugin/transform-plugin';
import { z } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';

export const Object2ArrayMappingRuleSchema = z.object({
  target: z.string(),
  source: z.string(),
});
export const Object2ArraySchema = z.object({
  fields: z.array(Object2ArrayMappingRuleSchema),
});

export interface Object2ArrayTransformerPluginConfig {
  fields: { target: string; source: string }[];
}
export const Object2ArrayPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration Object to Array
Transforme les propriétés d'un objet en un tableau d'objets. Utile pour convertir des objets indexés par clé en une liste exploitable.

**Champs :**
- **Fields** : Liste des correspondances.
    - **Source** : Chemin vers l'objet source (ex: \`$.valeurs\`).
    - **Target** : Nom du champ cible.`,
  fields: [
    {
      name: 'fields',
      label: 'Fields',
      controlType: 'array',
      group: {
        fields: [
          {
            name: 'target',
            label: 'Target',
            controlType: 'control',
            formType: 'input',
            inputType: 'text',
            optional: false,
            validators: [{ name: 'required' }],
          },
          {
            name: 'source',
            label: 'Source',
            controlType: 'control',
            formType: 'input',
            inputType: 'text',
            optional: false,
            validators: [{ name: 'required' }],
          },
        ],
        validators: [],
      },
    },
  ],
  validators: [],
};

@Injectable()
export class Object2arrayTransformerPluginService
  implements TransformPlugin<Object2ArrayTransformerPluginConfig>
{
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'object2array-transformer',
      type: 'transform',
      formDefinition: Object2ArrayPluginFormDefinition,
    };
  }
  getSchema(): z.ZodSchema {
    return Object2ArraySchema;
  }
  get name(): string {
    return Object2arrayTransformerPluginService.name;
  }
  private config: Object2ArrayTransformerPluginConfig;

  initialize(config: Object2ArrayTransformerPluginConfig): void {
    const parseResult = this.getSchema().safeParse(config);
    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.config = parseResult.data as Object2ArrayTransformerPluginConfig;
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
        'Object2Array configuration not provided.',
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

    return Promise.resolve(
      data
        .map((item) => {
          const obj = {} as any;

          for (const field of this.config.fields) {
            obj[field.target] = this.toArray(item, field.source);
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return obj;
        })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        .flatMap((it) => it.value),
    );
  }

  private toArray(item: any, field: string) {
    let array;
    const values: any = JsonPath.value(item, field);
    if (isObject(values)) {
      array = Object.keys(values).map((key, index) => {
        const value = values[key];
        return { index, value: { ...item, value } };
      });
    } else {
      throw new Error(
        'Not a valid value for Unwind must be Array or Json object',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return array;
  }
}
