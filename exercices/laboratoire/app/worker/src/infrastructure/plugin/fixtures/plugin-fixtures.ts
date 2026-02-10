// Centralized fake configurations that satisfy each plugin schema
// These are safe example values intended for tests, demos, and docs.

import { ApiSourceConfig } from '../services/sources/api-source-plugin.service';
import { FtpSourcePluginConfig } from '../services/sources/ftp-source-plugin.service';
import { SftpSourceOptions } from '../services/sources/sftp-source-plugin.service';
import { MongoSourcePluginConfig } from '../services/sources/mongo-source-plugin.service';
import { MySqlSourcePluginConfig } from '../services/sources/mysql-source-plugin.service';

import { FtpDestinationPluginConfig } from '../services/destinations/ftp-destination-plugin.service';
import { SftpDestinationOptions } from '../services/destinations/sftp-destination-plugin.service';
import { MongoDestinationPluginConfig } from '../services/destinations/mongo-destination-plugin.service';

import { Csv2jsonTransformerPluginConfig } from '../services/transformers/csv2json-transformer-plugin.service';
import { Json2CsvTransformerPluginConfig } from '../services/transformers/json2csv-transformer-plugin.service';
import { Group2csvTransformerPluginConfig } from '../services/transformers/group2csv-transformer-plugin.service';
import { Json2JsonTransformerPluginOptions } from '../services/transformers/json2json-transformer-plugin.service';
import { JsonGroup2jsonTransformerPluginConfig } from '../services/transformers/jsongroup2json-transformer-plugin.service';
import { JsonUnwindTransformerPluginConfig } from '../services/transformers/json-unwind-transformer-plugin.service';
import { GroupTransformConfig } from '../services/transformers/json-group-transformer-plugin.service';
import { Object2ArrayTransformerPluginConfig } from '../services/transformers/object2array-transformer-plugin.service';

// Metadata
import { z } from 'zod';
import { MetadataPluginSchema } from '../services/metadata/metadata-plugin.service';

export const apiSourceConfig: ApiSourceConfig = {
  url: 'https://example.com/api/items',
  method: 'GET',
  headers: [
    { name: 'Accept', value: 'application/json' },
    { name: 'X-Demo', value: 'true' },
  ],
  queryParams: [{ name: 'q', value: 'demo' }],
  authentication: { type: 'bearer', credentials: 'demo-token' },
  dataPath: '$.data.items',
  pagination: { enabled: false },
};

export const elasticSearchSourceConfig: ApiSourceConfig = {
  url: 'https://search.example.com/index/_search',
  method: 'POST',
  headers: [{ name: 'Content-Type', value: 'application/json' }],
  body: [{ name: 'query', value: '{"match_all":{}}' }],
  dataPath: '$.hits.hits',
  pagination: { enabled: false },
};

export const ftpSourceConfig: FtpSourcePluginConfig = {
  host: '127.0.0.1',
  port: 21,
  username: 'demo',
  password: 'demo',
  remotePath: '/inbox',
  isDir: true,
  filter: 'demo',
  archived: false,
  secured: false,
};

export const sftpSourceConfig: SftpSourceOptions = {
  host: '127.0.0.1',
  port: 22,
  username: 'demo',
  password: 'demo',
  remotePath: '/inbox',
  isDir: true,
  filter: 'demo',
  archived: false,
};

export const mongoSourceConfig: MongoSourcePluginConfig = {
  host: 'localhost',
  port: 27017,
  username: 'demo',
  password: 'demo',
  db: 'demo_db',
  collection: 'items',
  query: [
    { operator: '$match', expression: { active: true } },
    { operator: '$limit', expression: 10 },
  ],
};

export const mysqlSourceConfig: MySqlSourcePluginConfig = {
  host: '127.0.0.1',
  port: 3306,
  username: 'demo',
  password: 'demo',
  database: 'demo_db',
  $select: [{ selectField: 'id' }, { selectField: 'name' }],
  $from: { table: 'items', as: 'i' },
  $groupBy: [{ selectField: 'id' }],
  $where: [{ field: 'i.active', op: '=', value: 1 }],
  $orderBy: [{ field: 'i.id', value: 'ASC' }],
  $limit: 100,
  $offset: 0,
};

// Destinations
export const ftpDestinationConfig: FtpDestinationPluginConfig = {
  host: '127.0.0.1',
  port: 21,
  username: 'demo',
  password: 'demo',
  remotePath: '/outbox',
  isDir: true,
  filter: null,
  archived: false,
  secured: false,
};

export const sftpDestinationConfig: SftpDestinationOptions = {
  host: '127.0.0.1',
  port: 22,
  username: 'demo',
  password: 'demo',
  remotePath: '/outbox',
};

export const mongoDestinationConfig: MongoDestinationPluginConfig = {
  host: '127.0.0.1',
  port: 27017,
  username: 'demo',
  password: 'demo',
  db: 'demo_db',
  collection: 'items',
};

// Transformers
export const csv2jsonTransformerConfig: Csv2jsonTransformerPluginConfig = {
  separator: ';',
  lineDelimiter: '\n',
  parts: [{ headerLine: 1, name: 'header', slice: { start: 0, end: null } }],
};

export const json2csvTransformerConfig: Json2CsvTransformerPluginConfig = {
  filename: 'export',
  timeFormat: 'yyyyMMdd',
  separator: ';',
  timestamp: true,
};

export const group2csvTransformerConfig: Group2csvTransformerPluginConfig = {
  filename: '`group_${it.group}`',
  timeFormat: 'yyyyMMdd',
  separator: ';',
  timestamp: true,
};

export const json2jsonTransformerConfig: Json2JsonTransformerPluginOptions = {
  dateFormat: 'yyyy-MM-dd',
  mappingRules: [
    { destField: 'id', mappingRule: '$.id' },
    { destField: 'name', mappingRule: '$.name' },
  ],
};

export const jsonGroup2jsonTransformerConfig: JsonGroup2jsonTransformerPluginConfig =
  {
    dateFormat: 'yyyy-MM-dd',
    mappingRules: [
      {
        mappingRule: [
          { destField: 'group', mappingRule: '$.group' },
          { destField: 'total', mappingRule: '$.total' },
        ],
      },
    ],
  };

export const jsonUnwindTransformerConfig: JsonUnwindTransformerPluginConfig = {
  fields: [{ field: '$.items' }],
};

export const jsonGroupTransformerConfig: GroupTransformConfig = {
  rule: '$.group',
};

export const object2arrayTransformerConfig: Object2ArrayTransformerPluginConfig =
  {
    fields: [{ target: 'values', source: '$.payload' }],
  };

// Metadata (use the schema type via zod inference here to avoid service export change)
export type MetadataConfig = z.infer<typeof MetadataPluginSchema>;
export const metadataConfig: MetadataConfig = {
  id: 'wf-demo',
  name: 'demo-workflow',
  description: 'Demo workflow for fixtures',
  cronExpression: '* * * * * *',
  folder: '/demo',
  active: true,
};

export const PluginFixtures = {
  // metadata
  metadata: metadataConfig,

  // sources
  'api-source': apiSourceConfig,
  'elastic-search-source': elasticSearchSourceConfig,
  'ftp-source': ftpSourceConfig,
  'sftp-source': sftpSourceConfig,
  'mongo-source': mongoSourceConfig,
  'mysql-source': mysqlSourceConfig,

  // destinations
  'ftp-destination': ftpDestinationConfig,
  'sftp-destination': sftpDestinationConfig,
  'mongo-destination-plugin': mongoDestinationConfig,

  // transformers
  'csv2json-transformer': csv2jsonTransformerConfig,
  'json2csv-transformer': json2csvTransformerConfig,
  'group2csv-transformer': group2csvTransformerConfig,
  'json2json-transformer': json2jsonTransformerConfig,
  'jsonGroup2json-transformer': jsonGroup2jsonTransformerConfig,
  'json-unwind-transformer': jsonUnwindTransformerConfig,
  'json-group-transformer': jsonGroupTransformerConfig,
  'object2array-transformer': object2arrayTransformerConfig,
} as const;

export type PluginFixtureName = keyof typeof PluginFixtures;
