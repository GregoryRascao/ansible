import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

import { z } from 'zod';
import { SourcePlugin } from '../../../../domain/plugin/source-plugin';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';

export const MongoAggregateSchema = z
  .object({
    operator: z
      .enum(['$match', '$project', '$sort', '$limit', '$skip'])
      .default('$match'),
    expression: z.any(),
  })
  .partial();

export const MongoSourcePluginConfigSchema = z.object({
  host: z.string(),
  port: z.number().int().positive(),
  username: z.string(),
  password: z.string(),
  db: z.string(),
  collection: z.string(),
  query: z.array(MongoAggregateSchema),
});

export const MongoSourcePluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration MongoDB Source
Extrait des données d'une collection MongoDB en utilisant un pipeline d'agrégation.

**Paramètres :**
- **Connexion** : Host, Port, Username, Password, Database.
- **Collection** : Nom de la collection cible.
- **Query (Pipeline)** : Liste d'étapes d'agrégation ($match, $sort, $project, etc.). Chaque étape nécessite un opérateur et une expression JSON valide.`,
  fields: [
    {
      name: 'host',
      label: 'Host',
      controlType: 'control',
      formType: 'input',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'port',
      label: 'Port',
      controlType: 'control',
      formType: 'input',
      inputType: 'number',
      defaultValue: 27017,
      optional: false,
      validators: [{ name: 'required' }, { name: 'min', params: 1 }],
    },
    {
      name: 'username',
      label: 'Username',
      controlType: 'control',
      formType: 'input',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'password',
      label: 'Password',
      controlType: 'control',
      formType: 'input',
      inputType: 'password',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'db',
      label: 'Database name',
      controlType: 'control',
      formType: 'input',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'collection',
      label: 'Collection name',
      controlType: 'control',
      formType: 'input',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'query',
      label: 'Query',
      controlType: 'array',
      group: {
        fields: [
          {
            name: 'operator',
            label: 'Operator',
            controlType: 'control',
            formType: 'select',
            selectValues: [
              { label: '$match', value: '$match' },
              { label: '$project', value: '$project' },
              { label: '$sort', value: '$sort' },
              { label: '$limit', value: '$limit' },
              { label: '$skip', value: '$skip' },
              { label: '$group', value: '$group' },
              { label: '$unwind', value: '$unwind' },
              { label: '$lookup', value: '$lookup' },
              { label: '$facet', value: '$facet' },
            ],
            defaultValue: '$match',
            optional: false,
            validators: [{ name: 'required' }],
          },
          {
            name: 'expression',
            label: 'Expression',
            controlType: 'control',
            formType: 'textarea',
            validators: [{ name: 'required' }, { name: 'json' }],
            optional: false,
          },
        ],
        validators: [],
      },
      optional: false,
      validators: [{ name: 'required' }],
    },
  ],
  validators: [],
};

export type MongoAggregate = z.infer<typeof MongoAggregateSchema>;
export type MongoSourcePluginConfig = z.infer<
  typeof MongoSourcePluginConfigSchema
>;

@Injectable()
export class MongoSourcePluginService
  implements SourcePlugin<MongoSourcePluginConfig>
{
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'mongo-source',
      type: 'source',
      formDefinition: MongoSourcePluginFormDefinition,
    };
  }
  getSchema(): z.ZodSchema {
    return MongoSourcePluginConfigSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }
  private $config: MongoSourcePluginConfig;

  public buildAggregate(query: MongoSourcePluginConfig['query']): any[] {
    const aggregateDefaultValue: Array<Record<string, any>> = [];
    return query.reduce((old, current) => {
      const expression = JSON.parse(current.expression);
      const operator = current.operator as string;

      const keys = Object.keys(expression);
      if (
        expression &&
        typeof expression === 'object' &&
        keys.length === 1 &&
        keys[0].startsWith('$')
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return [...old, expression];
      }

      return [...old, { [operator]: expression }];
    }, aggregateDefaultValue);
  }

  initialize(config: MongoSourcePluginConfig): void {
    const parseResult = this.getSchema().safeParse(config);

    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.$config = parseResult.data as MongoSourcePluginConfig;
  }

  async extract(
    workflow_name: string,
    job_id: any,
    step_id: any,
  ): Promise<any[]> {
    if (!this.$config) {
      throw new Error('Mongo configuration not provided.');
    }
    const { username, password, host, port, db, collection } = this.$config;
    const connectionString = `mongodb://${username}:${password}@${host}:${port}/${db}`;
    const connection = mongoose.createConnection(connectionString);

    const collections = await connection.listCollections();
    if (!collections.find((it) => it.name == collection)) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        `Collection ${collection} not found.`,
      );
    }
    const col = connection.collection(collection);

    const aggregate = this.buildAggregate(this.$config.query);
    const cursor = col.aggregate(aggregate);
    const data = await cursor.toArray();
    await connection.close();

    return data;
  }
}
