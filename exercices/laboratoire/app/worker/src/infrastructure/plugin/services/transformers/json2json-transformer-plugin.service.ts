import * as JsonPath from 'jsonpath';
import { Injectable } from '@nestjs/common';
import { TransformPlugin } from '../../../../domain/plugin/transform-plugin';
import { z, ZodType } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';
import { format, isDate, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Json2JsonMappingRuleSchema = z.object({
  destField: z.string(),
  mappingRule: z.any(),
  sourceType: z.string().optional(),
  sourceDateFormat: z.string().or(z.null()).optional(),
  linkTo: z.string().optional(),
  linkValue: z.string().optional(),
});
export const Json2JsonSchema = z.object({
  dateFormat: z.string().optional().or(z.null()),
  mappingRules: z.array(Json2JsonMappingRuleSchema),
});

export const Json2JsonPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration JSON to JSON
Réapplique une structure JSON différente à partir des données d'entrée.

**Fonctionnement :**
- **Date format** : Format de date cible.
- **Mapping rules** : Liste des règles de transformation.
    - **Destination field** : Nom du champ dans l'objet de sortie.
    - **Mapping rule** : 
        - Commence par \`$\` : JSONPath (ex: \`$.data.valeur\`).
        - Sinon : Code Javascript (ex: \`(item) => item.valeur * 2\`).
    - **Source type** : Indique si la source est une date pour appliquer un reformatage.`,
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
        inLine: true,
        fields: [
          {
            name: 'destField',
            label: 'Destination fields',
            controlType: 'control',
            formType: 'input',
            inputType: 'text',
            optional: false,
            validators: [{ name: 'required' }],
          },

          {
            name: 'mappingRule',
            label: 'Mapping rule',
            controlType: 'control',
            formType: 'input',
            inputType: 'text',
            optional: false,
            validators: [{ name: 'required' }],
          },
          {
            name: 'sourceType',
            label: 'Source type',
            controlType: 'control',
            formType: 'select',
            selectValues: [
              { label: 'Any', value: 'any' },
              { label: 'Chaine de caractère', value: 'string' },
              { label: 'Date', value: 'date' },
            ],
            optional: true,
            defaultValue: 'any',
          },
          {
            name: 'sourceDateFormat',
            label: 'Source date format',
            controlType: 'control',
            formType: 'input',
            inputType: 'text',
            optional: true,
            linkTo: 'sourceType',
            linkValue: 'date',
          },
        ],
        validators: [],
      },
      validators: [],
    },
  ],
  validators: [],
};

export type Json2JsonMappingRule = z.infer<typeof Json2JsonMappingRuleSchema>;
export type Json2JsonTransformerPluginOptions = z.infer<typeof Json2JsonSchema>;

@Injectable()
export class Json2jsonTransformerPluginService
  implements TransformPlugin<Json2JsonTransformerPluginOptions>
{
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'json2json-transformer',
      type: 'transform',
      formDefinition: Json2JsonPluginFormDefinition,
    };
  }
  getSchema(): ZodType {
    return Json2JsonSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }
  private _config: Json2JsonTransformerPluginOptions;

  initialize(config: Json2JsonTransformerPluginOptions): void {
    const parseResult = this.getSchema().safeParse(config);
    if (!parseResult.success) {
      throw parseResult.error;
    }
    this._config = parseResult.data as Json2JsonTransformerPluginOptions;
  }

  transform(
    workflow_name: string,
    job_id: any,
    step_id: any,
    data: any[],
  ): Promise<any[]> {
    const transformed: any[] = [];

    if (!this._config) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'Json2Json configuration not provided.',
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

    data.forEach((item) =>
      transformed.push(this.transformJson(item, this._config.mappingRules)),
    );

    return Promise.resolve(transformed);
  }

  private cleanJsonKeys(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return obj; // Retourne les valeurs primitives ou null telles quelles
    }
    if (obj instanceof Date) {
      return obj;
    }

    if (Array.isArray(obj)) {
      // Si c'est un tableau, nettoie chaque élément du tableau
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return obj.map((item) => this.cleanJsonKeys(item));
    }

    // Si c'est un objet, parcourt ses clés
    const cleanedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Applique la fonction de nettoyage à la clé
        const cleanedKey = key.replace(/\ufeff/g, ''); // Supprime le BOM

        // Appelle récursivement pour les valeurs qui sont des objets ou des tableaux
        cleanedObj[cleanedKey] = this.cleanJsonKeys(obj[key]);
      }
    }
    return cleanedObj;
  }

  public transformJson(item: any, mappingRules: Json2JsonMappingRule[]) {
    const transformed = {} as any;
    for (const mappingRule of mappingRules) {
      const { destField, mappingRule: rule } = mappingRule;

      if (typeof rule == 'string' && rule.startsWith('$')) {
        transformed[destField] = this.transformQuery(item, mappingRule);
      } else if (typeof rule == 'string') {
        transformed[destField] = this.transformString(item, mappingRule);
      } else if (typeof rule == 'object') {
        transformed[destField] = this.transformObject(item, mappingRule);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return transformed;
  }

  private transformObject(item: any, rule: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.transformJson(item, rule);
  }

  private transformString(item: any, rule: Json2JsonMappingRule) {
    let transformedValue: any;
    try {
      const evalValue = eval(rule.mappingRule);
      if (typeof evalValue == 'function') {
        transformedValue = evalValue(item);
      } else if (typeof evalValue == 'number') {
        transformedValue = evalValue;
      } else {
        transformedValue = evalValue;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      transformedValue = rule.mappingRule;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return transformedValue;
  }

  private transformQuery(item: any, rule: Json2JsonMappingRule) {
    item = this.cleanJsonKeys(item);
    const transformedValue = JsonPath.query(item, rule.mappingRule);

    if (
      transformedValue.length == 1 &&
      rule.sourceType == 'date' &&
      !isDate(transformedValue[0])
    ) {
      let parsed: Date;
      try {
        parsed = parse(
          transformedValue[0],
          rule.sourceDateFormat || 'yyyy-MM-dd HH:mm',
          new Date(),
          { locale: fr },
        );
      } catch (e) {
        parsed = new Date(transformedValue[0]);
      }

      if (isNaN(parsed.getTime())) {
        parsed = new Date(transformedValue[0]);
      }

      if (isNaN(parsed.getTime())) {
        throw new Error('Invalid date');
      }

      return format(parsed, this._config.dateFormat || 'yyyy-MM-dd HH:mm');
    } else if (transformedValue.length == 1 && rule.sourceType == 'date') {
      return format(
        transformedValue[0],
        this._config.dateFormat || 'yyyy-MM-dd HH:mm',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return transformedValue.length == 1
      ? transformedValue[0]
      : transformedValue;
  }
}
