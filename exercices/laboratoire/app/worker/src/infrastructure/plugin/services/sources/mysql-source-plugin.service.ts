import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SourcePlugin } from '../../../../domain/plugin/source-plugin';
import { z } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';

export const MySqlPredicateOptionSchema = z.object({
  tAlias: z.string().optional().or(z.null()),
  field: z.string(),
  op: z.union([
    z.literal('='),
    z.literal('>'),
    z.literal('<'),
    z.literal('>='),
    z.literal('<='),
    z.literal('IN'),
    z.literal('BETWEEN'),
    z.literal('LIKE'),
  ]),
  value: z.any(),
  rawValue: z.string().optional().or(z.null()),
});
export const MySqlPredicateOptionsSchema = z.array(MySqlPredicateOptionSchema);
export const MySqlOrderByOptionSchema = z.object({
  field: z.string(),
  value: z.union([z.literal('ASC'), z.literal('DESC')]).optional(),
});
export const MySqlOrderByOptionsSchema = z.array(MySqlOrderByOptionSchema);
export const MySqlJoinOptionSchema = z.object({
  type: z.union([z.literal('INNER JOIN'), z.literal('LEFT OUTER JOIN')]),
  table: z.string(),
  as: z.string(),
  on: MySqlPredicateOptionSchema,
});
export const MySqlJoinOptionsSchema = z.array(MySqlJoinOptionSchema);
export const MySqlFromOptionSchema = z.object({
  table: z.string(),
  as: z.string().optional(),
});
export const MySqlSelectOptionSchema = z.object({
  selectField: z.string(),
});
export const MySqlSourcePluginConfigSchema = z.object({
  host: z.string(),
  port: z.number().int().positive(),
  username: z.string(),
  password: z.string(),
  database: z.string(),
  query: z.string().nullable().optional(),
  $select: z.array(MySqlSelectOptionSchema).optional(),
  $from: MySqlFromOptionSchema.optional(),
  $join: MySqlJoinOptionsSchema.optional(),
  $where: MySqlPredicateOptionsSchema.optional(),
  $groupBy: z.array(MySqlSelectOptionSchema).optional(),
  $having: MySqlPredicateOptionsSchema.optional(),
  $orderBy: MySqlOrderByOptionsSchema.optional(),
  $limit: z.number().int().positive().optional().or(z.null()),
  $offset: z.number().int().optional().or(z.null()),
});

export type MySqlPredicateOption = z.infer<typeof MySqlPredicateOptionSchema>;
export type MySqlSourcePluginConfig = z.infer<
  typeof MySqlSourcePluginConfigSchema
>;

export const MysqlSourcePluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration MySQL Source
Ce plugin permet d'extraire des données d'une base de données MySQL.

**Champs principaux :**
- **Host / Port / Username / Password / Database** : Informations de connexion standard.
- **Custom SQL Query** : Permet de saisir une requête SQL brute. Si rempli, il remplace la construction structurée ($select, $from, etc.).
- **$select / $from / $join / $where** : Permettent de construire une requête SQL de manière structurée via l'interface.
- **$limit / $offset** : Pour la pagination des résultats.`,
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
      defaultValue: 3306,
      optional: false,
      validators: [{ name: 'required' }, { name: 'min', params: [1] }],
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
      name: 'database',
      label: 'Database',
      controlType: 'control',
      formType: 'input',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'query',
      label: 'Custom SQL Query',
      controlType: 'control',
      formType: 'textarea', // Changed to textarea for better UX with raw SQL
      optional: true,
      validators: [],
    },
    {
      name: '$select',
      label: 'Select Fields',
      controlType: 'array',
      group: {
        inLine: true,
        fields: [
          {
            name: 'selectField',
            label: 'Field Name',
            controlType: 'control',
            formType: 'input',
            validators: [{ name: 'required' }],
          },
        ],
        validators: [],
      },
    },
    {
      name: '$from',
      label: 'From Clause',
      controlType: 'group',
      fields: [
        {
          name: 'table',
          label: 'Table',
          controlType: 'control',
          formType: 'input',
          optional: false,
          validators: [{ name: 'required' }],
        },
        {
          name: 'as',
          label: 'Alias',
          controlType: 'control',
          formType: 'input',
          optional: true,
          validators: [],
        },
      ],
    },
    {
      name: '$join',
      label: 'Joins',
      controlType: 'array',
      group: {
        inLine: false,
        fields: [
          {
            name: 'type',
            label: 'Join Type',
            controlType: 'control',
            formType: 'select',
            selectValues: [
              { label: 'Inner Join', value: 'INNER JOIN' },
              { label: 'Left Outer Join', value: 'LEFT OUTER JOIN' },
            ],
            validators: [{ name: 'required' }],
          },
          {
            name: 'table',
            label: 'Table',
            controlType: 'control',
            formType: 'input',
            validators: [{ name: 'required' }],
          },
          {
            name: 'as',
            label: 'Alias',
            controlType: 'control',
            formType: 'input',
            validators: [{ name: 'required' }],
          },
          {
            name: 'on',
            label: 'Join Condition (ON)',
            controlType: 'group',
            fields: [
              {
                name: 'tAlias',
                label: 'T-Alias',
                controlType: 'control',
                formType: 'input',
              },
              {
                name: 'field',
                label: 'Field',
                controlType: 'control',
                formType: 'input',
              },
              {
                name: 'op',
                label: 'Op',
                controlType: 'control',
                formType: 'select',
                selectValues: [{ label: '=', value: '=' }], // Usually '=' for joins
              },
              {
                name: 'value',
                label: 'Value/Target Field',
                controlType: 'control',
                formType: 'input',
              },
            ],
          },
        ],
        validators: [],
      },
    },
    {
      name: '$where',
      label: 'Where Conditions',
      controlType: 'array',
      group: {
        inLine: true,
        fields: [
          {
            name: 'tAlias',
            label: 'Table Alias',
            controlType: 'control',
            formType: 'input',
            validators: [],
          },
          {
            name: 'field',
            label: 'Field',
            controlType: 'control',
            formType: 'input',
            validators: [{ name: 'required' }],
          },
          {
            name: 'op',
            label: 'Operator',
            controlType: 'control',
            formType: 'select',
            selectValues: [
              { label: '=', value: '=' },
              { label: '>', value: '>' },
              { label: '<', value: '<' },
              { label: '>=', value: '>=' },
              { label: '<=', value: '<=' },
              { label: 'IN', value: 'IN' },
              { label: 'BETWEEN', value: 'BETWEEN' },
              { label: 'LIKE', value: 'LIKE' },
            ],
            validators: [{ name: 'required' }],
          },
          {
            name: 'value',
            label: 'Value',
            controlType: 'control',
            formType: 'input',
            validators: [],
          },
          {
            name: 'rawValue',
            label: 'Raw SQL Value',
            controlType: 'control',
            formType: 'input',
            validators: [],
          },
        ],
        validators: [],
      },
    },
    {
      name: '$groupBy',
      label: 'Group By',
      controlType: 'array',
      group: {
        inLine: true,
        fields: [
          {
            name: 'selectField',
            label: 'Field',
            controlType: 'control',
            formType: 'input',
            validators: [{ name: 'required' }],
          },
        ],
        validators: [],
      },
    },
    {
      name: '$having',
      label: 'Having Conditions',
      controlType: 'array',
      group: {
        inLine: true,
        fields: [
          {
            name: 'field',
            label: 'Field',
            controlType: 'control',
            formType: 'input',
            validators: [{ name: 'required' }],
          },
          {
            name: 'op',
            label: 'Operator',
            controlType: 'control',
            formType: 'select',
            selectValues: [
              { label: '=', value: '=' },
              { label: '>', value: '>' },
              { label: '<', value: '<' },
            ],
            validators: [{ name: 'required' }],
          },
          {
            name: 'value',
            label: 'Value',
            controlType: 'control',
            formType: 'input',
            validators: [],
          },
        ],
        validators: [],
      },
    },
    {
      name: '$orderBy',
      label: 'Order By',
      controlType: 'array',
      group: {
        inLine: true,
        fields: [
          {
            name: 'field',
            label: 'Field',
            controlType: 'control',
            formType: 'input',
            validators: [{ name: 'required' }],
          },
          {
            name: 'value',
            label: 'Direction',
            controlType: 'control',
            formType: 'select',
            selectValues: [
              { label: 'ASC', value: 'ASC' },
              { label: 'DESC', value: 'DESC' },
            ],
            validators: [{ name: 'required' }],
          },
        ],
        validators: [],
      },
    },
    {
      name: '$limit',
      label: 'Limit',
      controlType: 'control',
      formType: 'input',
      inputType: 'number',
      validators: [],
    },
    {
      name: '$offset',
      label: 'Offset',
      controlType: 'control',
      formType: 'input',
      inputType: 'number',
      validators: [],
    },
  ],
  validators: [],
};

@Injectable()
export class MysqlSourcePluginService
  implements SourcePlugin<MySqlSourcePluginConfig>
{
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'mysql-source',
      type: 'source',
      formDefinition: MysqlSourcePluginFormDefinition,
    };
  }
  get name() {
    return this.getPluginDefinition().name;
  }
  getSchema(): z.ZodSchema {
    return MySqlSourcePluginConfigSchema;
  }
  private config: MySqlSourcePluginConfig;

  initialize(config: MySqlSourcePluginConfig): void {
    const parseResult = this.getSchema().safeParse(config);

    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.config = parseResult.data as MySqlSourcePluginConfig;
  }

  async extract(
    workflow_name: string,
    job_id: any,
    step_id: any,
  ): Promise<any[]> {
    if (!this.config) {
      throw new Error('Mysql configuration not provided.');
    }
    const { username, password, host, port, database, $limit, $offset } =
      this.config;
    const {
      query,
      $select,
      $from,
      $join,
      $where,
      $groupBy,
      $having,
      $orderBy,
    } = this.config;

    const target = new DataSource({
      type: 'mysql',
      host,
      port,
      database,
      password,
      username,
      insecureAuth: true,
    });

    try {
      await target.initialize();
      const em = target.manager;

      if (query) {
        return await em.query(query);
      }

      if (!$from) {
        throw new Error(
          'Mysql configuration: $from is required if query is not provided.',
        );
      }

      let qb = em
        .createQueryBuilder()
        .from($from.table as any, $from.as as any);

      for (const join of $join || []) {
        if (join.type == 'INNER JOIN') {
          qb = qb.innerJoinAndSelect(
            join.table,
            join.as,
            `${join.as}.${join.on.field} ${join.on.op} ${join.on.value}`,
          );
        } else if (join.type == 'LEFT OUTER JOIN') {
          qb = qb.leftJoinAndSelect(
            join.table,
            join.as,
            `${join.as}.${join.on.field} ${join.on.op} ${join.on.value}`,
          );
        }
      }

      for (const [index, where] of ($where || []).entries()) {
        let whereStr;
        if (where.op == 'IN') {
          whereStr = `${where.tAlias || $from.as}.${where.field} ${where.op} ${where.rawValue ? where.rawValue : `(:...v${index})`}`;
        } else {
          whereStr = `${where.tAlias || $from.as}.${where.field} ${where.op} ${where.rawValue ? where.rawValue : `:v${index}`}`;
        }

        if (where.rawValue) {
          qb = qb.andWhere(whereStr);
        } else {
          qb = qb.andWhere(whereStr, {
            [`v${index}`]: where.value,
          });
        }
      }
      for (const groupBy of $groupBy || []) {
        qb = qb.addGroupBy(groupBy.selectField);
      }

      for (const having of $having || []) {
        qb = qb.andHaving(
          `${having.tAlias || $from.as}.${having.field} ${having.op} :value`,
          { value: having.value },
        );
      }

      if (!$select || $select.length == 0) {
        qb = qb.addSelect('t1.*');
      }
      for (const select of $select || []) {
        qb = qb.addSelect(select.selectField);
      }

      for (const orderBy of $orderBy || []) {
        qb = qb.addOrderBy(orderBy.field, orderBy.value);
      }

      if ($limit) {
        qb = qb.limit($limit);
      }

      if ($offset) {
        qb = qb.offset($offset);
      }

      return await qb.getRawMany();
    } catch (e) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        `Mysql error: ${e}`,
      );
    } finally {
      await target.destroy();
    }
  }
}
