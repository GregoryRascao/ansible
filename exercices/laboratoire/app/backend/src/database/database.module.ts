import {
  JobHistory,
  JobHistorySchema,
} from '@database/schemas/job-history.schema';
import { Plugin, PluginSchema } from '@database/schemas/plugin.schema';
import { Workflow, WorkflowSchema } from '@database/schemas/workflow.schema';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import {
  JobExecuting,
  JobExecutingSchema,
} from './schemas/job-executing.schema';
import {
  JobStepHistory,
  JobStepHistorySchema,
} from './schemas/job-step-history.schema';
import { Worker, WorkerSchema } from './schemas/worker.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (env: ConfigService) => {
        const source = {} as MongooseModuleFactoryOptions;
        const username = env.get('MONGO_USERNAME');
        const password = env.get('MONGO_PASSWORD');
        const uri = env.get('MONGO_URI');

        if (uri) {
          source.uri = uri;
        } else {
          source.uri = `mongodb://${username}:${password}@${env.get('MONGO_HOST')}:${env.get('MONGO_PORT')}/${env.get('MONGO_DATABASE')}?authSource=${env.get('MONGO_AUTH_SOURCE')}`;
        }
        return source;
      },
    }),
    MongooseModule.forFeature([
      { name: Worker.name, schema: WorkerSchema },
      { name: Workflow.name, schema: WorkflowSchema },
      { name: Plugin.name, schema: PluginSchema },
      { name: JobHistory.name, schema: JobHistorySchema },
      { name: JobStepHistory.name, schema: JobStepHistorySchema },
      { name: JobExecuting.name, schema: JobExecutingSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
