import { groupBy } from 'ts-array-extensions';
import * as jsonPath from 'jsonpath';
import { Injectable } from '@nestjs/common';
import { TransformPlugin } from '../../../../domain/plugin/transform-plugin';
import { z, ZodType } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';

export const JsonGroupSchema = z.object({
  rule: z.string(),
});

export type GroupTransformConfig = z.infer<typeof JsonGroupSchema>;

export const JsonGroupPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration JSON Group
Groupe un tableau d'objets JSON selon une règle spécifique.

**Règle (Rule) :**
- **JSONPath** : Ex: \`$.client.id\` pour grouper par ID client.
- **Javascript** : Une fonction eval permettant de définir une logique de groupage personnalisée.`,
  fields: [
    {
      name: 'rule',
      label: 'Rule',
      formType: 'input',
      controlType: 'control',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
  ],
  validators: [],
};

@Injectable()
export class JsonGroupTransformerPluginService
  implements TransformPlugin<GroupTransformConfig>
{
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'json-group-transformer',
      type: 'transform',
      formDefinition: JsonGroupPluginFormDefinition,
    };
  }
  getSchema(): ZodType {
    return JsonGroupSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }
  private $config: GroupTransformConfig;

  initialize(config: GroupTransformConfig) {
    const parseResult = this.getSchema().safeParse(config);
    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.$config = parseResult.data as GroupTransformConfig;
  }

  transform(
    workflow_name: string,
    job_id: any,
    step_id: any,
    data: any[],
  ): Promise<any[]> {
    if (!this.$config) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'JsonGroup configuration not provided.',
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
      groupBy(data, (it) => {
        const { rule } = this.$config;
        let valueData: any;
        if (rule.startsWith('$')) {
          valueData = jsonPath.value(it, rule);
        } else {
          const evalValue = eval(rule);
          if (typeof evalValue == 'function') {
            valueData = evalValue(it);
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return valueData;
      }),
    );
  }
}
