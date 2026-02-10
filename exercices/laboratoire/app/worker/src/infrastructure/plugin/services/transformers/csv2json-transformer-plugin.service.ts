import { Injectable } from '@nestjs/common';
import { TransformPlugin } from '../../../../domain/plugin/transform-plugin';
import { z, ZodType } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';

export const Csv2jsonPartSchema = z.object({
  headerLine: z.number().int().nonnegative(),
  name: z.string(),
  slice: z.object({
    start: z.number().int().nonnegative(),
    end: z.number().int().positive().optional().or(z.null()),
  }),
});
export const Csv2jsonSchema = z.object({
  separator: z.string(),
  lineDelimiter: z.string().optional(),
  parts: z.array(Csv2jsonPartSchema),
});

export type Csv2jsonTransformerPluginConfig = z.infer<typeof Csv2jsonSchema>;

export const Csv2JsonPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration CSV to JSON
Transforme un contenu CSV en objets JSON.

**Paramètres :**
- **Separator** : Caractère de séparation (ex: \`;\` ou \`,\`).
- **Line delimiter** : Délimiteur de fin de ligne (\\n ou \\r\\n).
- **Parts** : Permet de définir différentes sections du CSV à extraire.
    - **Header line** : Numéro de la ligne contenant les titres.
    - **Header name** : Nom de la clé JSON pour cette partie.
    - **Slice** : Début et fin de l'extraction des données.`,
  fields: [
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
      name: 'lineDelimiter',
      label: 'Line delimiter',
      formType: 'select',
      controlType: 'control',
      optional: false,
      validators: [{ name: 'required' }],
      selectValues: [
        { label: 'New line (\\n)', value: '\\\\n' },
        { label: 'New line + carriage return (\\r\\n)', value: '\\\\r\\\\n' },
      ],
    },
    {
      name: 'parts',
      label: 'Parts',
      controlType: 'array',
      group: {
        fields: [
          {
            name: 'headerLine',
            label: 'Header line',
            formType: 'input',
            controlType: 'control',
            inputType: 'number',
            optional: false,
            validators: [{ name: 'required' }],
          },
          {
            name: 'name',
            label: 'Header name',
            formType: 'input',
            controlType: 'control',
            inputType: 'text',
            optional: false,
            validators: [{ name: 'required' }],
          },
          {
            name: 'slice',
            label: 'Slice',
            controlType: 'group',
            fields: [
              {
                name: 'start',
                label: 'Start at line',
                formType: 'input',
                controlType: 'control',
                inputType: 'number',
                optional: false,
                validators: [{ name: 'required' }, { name: 'min', params: 0 }],
              },
              {
                name: 'end',
                label: 'End at line',
                formType: 'input',
                controlType: 'control',
                inputType: 'number',
                optional: true,
                validators: [],
              },
            ],
          },
        ],
        validators: [],
      },
    },
  ],
  validators: [],
};

@Injectable()
export class Csv2jsonTransformerPluginService
  implements TransformPlugin<Csv2jsonTransformerPluginConfig>
{
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'csv2json-transformer',
      type: 'transform',
      formDefinition: Csv2JsonPluginFormDefinition,
    };
  }
  getSchema(): ZodType {
    return Csv2jsonSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }
  private config: Csv2jsonTransformerPluginConfig;

  initialize(config: Csv2jsonTransformerPluginConfig): void {
    const parseResult = this.getSchema().safeParse(config);

    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.config = parseResult.data as Csv2jsonTransformerPluginConfig;
  }

  transform(
    workflow_name: string,
    job_id: any,
    step_id: any,
    data: any[],
  ): Promise<any> {
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
    const { lineDelimiter, parts } = this.config;
    const delimiter = (lineDelimiter || '\r\n')
      .replace(/\\\\r/g, '\r')
      .replace(/\\\\n/g, '\n');

    const json = [] as any[];

    for (const item of data) {
      const lines = item.split(delimiter);
      if (lines.length == 0) continue;

      const csvParts: any = {};
      for (const part of parts) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-return
        csvParts[part.name] = this.readLines(lines, part).map((value) => ({
          ...value,
        }));
      }
      json.push(csvParts);
    }

    return Promise.resolve(json);
  }

  private readLines(
    lines: string[],
    part: {
      headerLine: number;
      slice: { start: number; end?: number | null };
    },
  ) {
    const json = [] as any[];
    const { headerLine, slice } = part;
    const { separator } = this.config;
    const sep = separator.replace(/\\\\r/g, '\r').replace(/\\\\n/g, '\n');
    const keys = lines[headerLine].split(sep).map((it) => it.replace('"', ''));

    if (slice.start == headerLine) {
      slice.start++;
    }

    let values: string[];
    if (slice.start && slice.end) values = lines.slice(slice.start, slice.end);
    else values = lines.slice(slice.start);

    for (const v of values) {
      const line = v.split(sep);
      if (line.length == 1) continue;
      const obj = {} as any;
      for (let k = 0; k < keys.length; k++) {
        const key = keys[k];

        const numberValue = Number(line[k]);

        obj[key] = isNaN(numberValue) && line[k] != '0' ? line[k] : numberValue;
      }
      json.push(obj);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return json;
  }
}
