import { Injectable } from '@nestjs/common';
import { DestinationPlugin } from '../../../../domain/plugin/destination-plugin';
import { z } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';
import mongoose from 'mongoose';

export const MongoDestinationPluginConfigSchema = z.object({
  host: z.url().or(z.ipv4()).or(z.ipv6()),
  port: z.number().int().positive(),
  username: z.string(),
  password: z.string(),
  db: z.string(),
  collection: z.string(),
});

export const MongoDestinationPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration MongoDB Destination
Insère les données JSON dans une collection MongoDB.

**Paramètres :**
- **Host / Port / Username / Password** : Informations de connexion.
- **DB / Collection** : Base de données et collection de destination.`,
  fields: [],
  validators: [],
};

export type MongoDestinationPluginConfig = z.infer<
  typeof MongoDestinationPluginConfigSchema
>;

@Injectable()
export class MongoDestinationPluginService
  implements DestinationPlugin<MongoDestinationPluginConfig>
{
  private $config: MongoDestinationPluginConfig;
  initialize(init: MongoDestinationPluginConfig): void {
    const parseResult = this.getSchema().safeParse(init);
    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.$config = parseResult.data as MongoDestinationPluginConfig;
  }
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'mongo-destination-plugin',
      type: 'destination',
      formDefinition: MongoDestinationPluginFormDefinition,
    };
  }
  getSchema(): z.ZodSchema {
    return MongoDestinationPluginConfigSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }

  async publish(
    workflow_name: string,
    job_id: any,
    step_id: any,
    data: any[],
  ): Promise<any> {
    if (!this.$config) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'MongoDestination configuration not provided.',
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
    const { username, password, host, port, db, collection } = this.$config;

    const connectionString = `mongodb://${username}:${password}@${host}:${port}/${db}`;

    const connection = mongoose.createConnection(connectionString);

    const collections = await connection.listCollections();
    const finded = !!collections.find((it) => it.name == collection);
    let col;
    if (finded) {
      col = connection.collection(collection);
    } else {
      await connection.createCollection(collection);
      col = connection.collection(collection);
    }

    col.insertMany(data).then(() => connection.close());
  }
}
