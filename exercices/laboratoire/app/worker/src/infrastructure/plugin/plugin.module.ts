import { Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { PluginRegistry } from './plugin.registry';
import { BrokerService } from '../broker/services/broker.service';
import { ApiSourcePluginService } from './services/sources/api-source-plugin.service';
import { ElasticSearchSourcePluginService } from './services/sources/elastic-search-source-plugin.service';
import { FtpSourcePluginService } from './services/sources/ftp-source-plugin.service';
import { MongoSourcePluginService } from './services/sources/mongo-source-plugin.service';
import { MysqlSourcePluginService } from './services/sources/mysql-source-plugin.service';
import { SftpSourcePluginService } from './services/sources/sftp-source-plugin.service';
import { Csv2jsonTransformerPluginService } from './services/transformers/csv2json-transformer-plugin.service';
import { Json2csvTransformerPluginService } from './services/transformers/json2csv-transformer-plugin.service';
import { Json2jsonTransformerPluginService } from './services/transformers/json2json-transformer-plugin.service';
import { JsonGroupTransformerPluginService } from './services/transformers/json-group-transformer-plugin.service';
import { JsonUnwindTransformerPluginService } from './services/transformers/json-unwind-transformer-plugin.service';
import { JsonGroup2jsonTransformerPluginService } from './services/transformers/jsongroup2json-transformer-plugin.service';
import { Object2arrayTransformerPluginService } from './services/transformers/object2array-transformer-plugin.service';
import { MongoDestinationPluginService } from './services/destinations/mongo-destination-plugin.service';
import { SftpDestinationPluginService } from './services/destinations/sftp-destination-plugin.service';
import { FtpDestinationPluginService } from './services/destinations/ftp-destination-plugin.service';
import { MetadataPluginService } from './services/metadata/metadata-plugin.service';

const sourcePlugins = [
  ApiSourcePluginService,
  ElasticSearchSourcePluginService,
  FtpSourcePluginService,
  MongoSourcePluginService,
  MysqlSourcePluginService,
  SftpSourcePluginService,
];
const transformPlugins = [
  Csv2jsonTransformerPluginService,
  // Group2csvTransformerPluginService,
  Json2csvTransformerPluginService,
  Json2jsonTransformerPluginService,
  JsonGroupTransformerPluginService,
  JsonUnwindTransformerPluginService,
  JsonGroup2jsonTransformerPluginService,
  Object2arrayTransformerPluginService,
];
const destinationPlugins = [
  MongoDestinationPluginService,
  SftpDestinationPluginService,
  FtpDestinationPluginService,
];

@Module({
  imports: [DiscoveryModule],
  providers: [
    PluginRegistry,
    ...sourcePlugins,
    ...transformPlugins,
    ...destinationPlugins,
    MetadataPluginService,
  ],
  exports: [PluginRegistry],
})
export class PluginModule implements OnModuleInit {
  constructor(
    private readonly $registry: PluginRegistry,
    private readonly $broker: BrokerService,
  ) {}

  onModuleInit() {}
}
