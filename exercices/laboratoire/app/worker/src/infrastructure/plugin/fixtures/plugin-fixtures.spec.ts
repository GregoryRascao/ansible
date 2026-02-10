import { PluginFixtures } from './plugin-fixtures';

// Sources
import { ApiSourcePluginService } from '../services/sources/api-source-plugin.service';
import { ElasticSearchSourcePluginService } from '../services/sources/elastic-search-source-plugin.service';
import { FtpSourcePluginService } from '../services/sources/ftp-source-plugin.service';
import { SftpSourcePluginService } from '../services/sources/sftp-source-plugin.service';
import { MongoSourcePluginService } from '../services/sources/mongo-source-plugin.service';
import { MysqlSourcePluginService } from '../services/sources/mysql-source-plugin.service';

// Destinations
import { FtpDestinationPluginService } from '../services/destinations/ftp-destination-plugin.service';
import { SftpDestinationPluginService } from '../services/destinations/sftp-destination-plugin.service';
import { MongoDestinationPluginService } from '../services/destinations/mongo-destination-plugin.service';

// Transformers
import { Csv2jsonTransformerPluginService } from '../services/transformers/csv2json-transformer-plugin.service';
import { Json2csvTransformerPluginService } from '../services/transformers/json2csv-transformer-plugin.service';
import { Group2csvTransformerPluginService } from '../services/transformers/group2csv-transformer-plugin.service';
import { Json2jsonTransformerPluginService } from '../services/transformers/json2json-transformer-plugin.service';
import { JsonGroup2jsonTransformerPluginService } from '../services/transformers/jsongroup2json-transformer-plugin.service';
import { JsonUnwindTransformerPluginService } from '../services/transformers/json-unwind-transformer-plugin.service';
import { JsonGroupTransformerPluginService } from '../services/transformers/json-group-transformer-plugin.service';
import { Object2arrayTransformerPluginService } from '../services/transformers/object2array-transformer-plugin.service';

// Metadata
import { MetadataPluginService } from '../services/metadata/metadata-plugin.service';

describe('Plugin fixtures validation', () => {
  it('should validate metadata config', () => {
    const svc = new MetadataPluginService();
    const schema = svc.getSchema();
    const parse = schema.safeParse(PluginFixtures['metadata']);
    expect(parse.success).toBe(true);
  });

  it('should validate source configs', () => {
    const api = new ApiSourcePluginService();
    expect(
      api.getSchema().safeParse(PluginFixtures['api-source']).success,
    ).toBe(true);

    const es = new ElasticSearchSourcePluginService();
    expect(
      es.getSchema().safeParse(PluginFixtures['elastic-search-source']).success,
    ).toBe(true);

    const ftp = new FtpSourcePluginService();
    expect(
      ftp.getSchema().safeParse(PluginFixtures['ftp-source']).success,
    ).toBe(true);

    const sftp = new SftpSourcePluginService();
    expect(
      sftp.getSchema().safeParse(PluginFixtures['sftp-source']).success,
    ).toBe(true);

    const mongo = new MongoSourcePluginService();
    expect(
      mongo.getSchema().safeParse(PluginFixtures['mongo-source']).success,
    ).toBe(true);

    const mysql = new MysqlSourcePluginService();
    const result = mysql.getSchema().safeParse(PluginFixtures['mysql-source']);
    expect(result.success).toBe(true);
  });

  it('should validate destination configs', () => {
    const ftp = new FtpDestinationPluginService();
    expect(
      ftp.getSchema().safeParse(PluginFixtures['ftp-destination']).success,
    ).toBe(true);

    const sftp = new SftpDestinationPluginService();
    expect(
      sftp.getSchema().safeParse(PluginFixtures['sftp-destination']).success,
    ).toBe(true);

    const mongo = new MongoDestinationPluginService();
    expect(
      mongo.getSchema().safeParse(PluginFixtures['mongo-destination-plugin'])
        .success,
    ).toBe(true);
  });

  it('should validate transformer configs', () => {
    const csv2json = new Csv2jsonTransformerPluginService();
    expect(
      csv2json.getSchema().safeParse(PluginFixtures['csv2json-transformer'])
        .success,
    ).toBe(true);

    const json2csv = new Json2csvTransformerPluginService();
    expect(
      json2csv.getSchema().safeParse(PluginFixtures['json2csv-transformer'])
        .success,
    ).toBe(true);

    const group2csv = new Group2csvTransformerPluginService();
    expect(
      group2csv.getSchema().safeParse(PluginFixtures['group2csv-transformer'])
        .success,
    ).toBe(true);

    const json2json = new Json2jsonTransformerPluginService();
    expect(
      json2json.getSchema().safeParse(PluginFixtures['json2json-transformer'])
        .success,
    ).toBe(true);

    // jsongroup2json needs Json2json dependency only at transform time, not for schema
    const jsonGroup2json = new JsonGroup2jsonTransformerPluginService(
      undefined as any,
    );
    expect(
      jsonGroup2json
        .getSchema()
        .safeParse(PluginFixtures['jsonGroup2json-transformer']).success,
    ).toBe(true);

    const jsonUnwind = new JsonUnwindTransformerPluginService();
    expect(
      jsonUnwind
        .getSchema()
        .safeParse(PluginFixtures['json-unwind-transformer']).success,
    ).toBe(true);

    const jsonGroup = new JsonGroupTransformerPluginService();
    expect(
      jsonGroup.getSchema().safeParse(PluginFixtures['json-group-transformer'])
        .success,
    ).toBe(true);

    const obj2arr = new Object2arrayTransformerPluginService();
    expect(
      obj2arr.getSchema().safeParse(PluginFixtures['object2array-transformer'])
        .success,
    ).toBe(true);
  });
});
