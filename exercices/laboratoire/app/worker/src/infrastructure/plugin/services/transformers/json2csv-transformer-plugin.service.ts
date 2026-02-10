import { Injectable } from '@nestjs/common';
import { TransformPlugin } from '../../../../domain/plugin/transform-plugin';
import { z, ZodType } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';

export const Json2csvSchema = z.object({
  filename: z.string().optional(),
  timeFormat: z.string().or(z.null()).optional(),
  separator: z.string(),
  timestamp: z.boolean().default(false),
});

export const Json2csvPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration JSON to CSV
Convertit un tableau d'objets JSON en un fichier CSV.

**Options :**
- **Filename** : Nom du fichier de sortie.
- **Separator** : Caractère séparateur (ex: \`;\`).
- **Timestamp** : Ajoute un horodatage au nom du fichier.
- **Time format** : Format de l'horodatage.`,
  fields: [
    {
      name: 'filename',
      label: 'Filename',
      formType: 'input',
      controlType: 'control',
      inputType: 'text',
      optional: true,
      validators: [],
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
      validators: [],
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

export type Json2CsvTransformerPluginConfig = z.infer<typeof Json2csvSchema>;

@Injectable()
export class Json2csvTransformerPluginService
  implements TransformPlugin<Json2CsvTransformerPluginConfig>
{
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'json2csv-transformer',
      type: 'transform',
      formDefinition: Json2csvPluginFormDefinition,
    };
  }
  getSchema(): ZodType {
    return Json2csvSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }
  protected config: Json2CsvTransformerPluginConfig;

  initialize(config: Json2CsvTransformerPluginConfig): void {
    const parseResult = this.getSchema().safeParse(config);

    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.config = parseResult.data as Json2CsvTransformerPluginConfig;
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
        'Csv configuration not provided.',
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
    const { separator } = this.config;
    const titleLine = Object.keys(data[0]).join(separator) + '\n';

    const lines = [] as string[];

    lines.push(titleLine);
    for (const item of data) {
      const line = Object.values(item).join(separator) + '\n';
      lines.push(line);
    }

    return Promise.resolve([
      {
        file: Buffer.from(lines.join(''), 'utf-8'),
        filename:
          (this.config.filename &&
            `${this.config.filename}${this.config.timestamp ? `_${Date.now()}` : ''}.csv`) ||
          `file${this.config.timestamp ? `_${Date.now()}` : ''}.csv`,
      },
    ]);
  }
}
