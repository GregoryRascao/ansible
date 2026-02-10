import * as JsonPath from 'jsonpath';
import { format } from 'date-fns';
import { Injectable } from '@nestjs/common';
import { TransformPlugin } from '../../../../domain/plugin/transform-plugin';
import { z, ZodType } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { Json2csvTransformerPluginService } from './json2csv-transformer-plugin.service';
import { StepError } from '../../../../domain/plugin/StepError';

export const Group2csvSchema = z.object({
  filename: z.string(),
  timeFormat: z.string().optional(),
  separator: z.string(),
  timestamp: z.boolean().default(false),
});

export const Group2csvPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration Group to CSV
Génère plusieurs fichiers CSV à partir de données groupées.

**Champs :**
- **Filename** : Nom de base du fichier. Peut utiliser un chemin JSON (ex: \`$.nom\`) ou une fonction.
- **Separator** : Caractère séparateur.
- **Timestamp** : Ajoute la date actuelle au nom du fichier.
- **Time format** : Format de la date si Timestamp est activé.`,
  fields: [
    {
      name: 'filename',
      label: 'Filename',
      formType: 'input',
      controlType: 'control',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'timeFormat',
      label: 'Time format',
      formType: 'input',
      controlType: 'control',
      inputType: 'text',
      optional: true,
      validators: [],
    },
    {
      name: 'separator',
      label: 'Separator',
      formType: 'input',
      controlType: 'control',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'timestamp',
      label: 'Timestamp',
      formType: 'checkbox',
      controlType: 'control',
      defaultValue: false,
      optional: false,
      validators: [{ name: 'required' }],
    },
  ],
  validators: [],
};

export type Group2csvTransformerPluginConfig = z.infer<typeof Group2csvSchema>;
@Injectable()
export class Group2csvTransformerPluginService
  extends Json2csvTransformerPluginService
  implements TransformPlugin<Group2csvTransformerPluginConfig>
{
  initialize(config: Group2csvTransformerPluginConfig): void {
    const parseResult = this.getSchema().safeParse(config);

    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.config = parseResult.data as Group2csvTransformerPluginConfig;
  }
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'group2csv-transformer',
      type: 'transform',
      formDefinition: Group2csvPluginFormDefinition,
    };
  }
  getSchema(): ZodType {
    return Group2csvSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }
  async transform(
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
        'Group2Csv configuration not provided.',
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
    const files = [] as any[];
    for (const group of data) {
      const csv = (
        await super.transform(workflow_name, job_id, step_id, data)
      )[0];

      let newFilename;
      if (this.config.filename && this.config.filename.startsWith('$')) {
        newFilename = JsonPath.value(group, this.config.filename);
      } else if (this.config.filename) {
        const fValue = eval(this.config.filename);
        if (typeof fValue == 'function') {
          newFilename = fValue(group);
        }
      } else {
        throw new Error('Filename not provided.');
      }
      csv.filename = `${newFilename}${this.config.timestamp ? `_${format(new Date(), this.config.timeFormat || 'yyyy-MM-dd')}` : ''}.csv`;

      files.push(csv);
    }

    return files;
  }
}
