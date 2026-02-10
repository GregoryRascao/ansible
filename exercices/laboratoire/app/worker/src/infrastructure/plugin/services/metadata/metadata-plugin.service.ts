import { Injectable } from '@nestjs/common';
import { BasePlugin } from '../../../../domain/plugin/base-plugin';
import { z, ZodType } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';

export const MetadataPluginSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  cronExpression: z.string(),
  folder: z.string().optional(),
  active: z.boolean().default(true),
});
export const MetadataPluginDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration des Métadonnées du Workflow
Définit les paramètres généraux du workflow.

**Champs :**
- **Workflow name** : Nom unique du workflow.
- **Cron expression** : Fréquence d'exécution (format: ms s m h D M).
- **Folder** : Dossier de classement.
- **Active** : Active ou désactive l'exécution automatique.`,
  fields: [
    {
      name: 'id',
      label: 'Id',
      formType: 'input',
      controlType: 'control',
      optional: true,
      validators: [],
      inputType: 'hidden',
    },
    {
      name: 'name',
      label: 'Workflow name',
      formType: 'input',
      controlType: 'control',
      optional: false,
      validators: [
        {
          name: 'required',
        },
      ],
      inputType: 'text',
    },
    {
      name: 'description',
      label: 'Info',
      formType: 'input',
      controlType: 'control',
      optional: true,
      validators: [],
      inputType: 'text',
    },
    {
      name: 'cronExpression',
      label: 'Cron expression (s m h D M W)',
      formType: 'input',
      controlType: 'control',
      optional: false,
      validators: [
        {
          name: 'required',
        },
      ],
      inputType: 'text',
    },
    {
      name: 'folder',
      label: 'Folder',
      formType: 'input',
      controlType: 'control',
      optional: true,
      validators: [],
      inputType: 'text',
    },
    {
      name: 'active',
      label: 'Active',
      formType: 'checkbox',
      controlType: 'control',
      optional: true,
      defaultValue: true,
      validators: [],
    },
  ],
  validators: [],
};

@Injectable()
export class MetadataPluginService implements BasePlugin<any> {
  initialize(init: any): void {
    const parseResult = this.getSchema().safeParse(init);
    if (!parseResult.success) {
      throw parseResult.error;
    }
  }
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'metadata',
      type: 'metadata',
      formDefinition: MetadataPluginDefinition,
    };
  }
  getSchema(): ZodType {
    return MetadataPluginSchema;
  }
  get name(): string {
    return MetadataPluginService.name;
  }
}
