import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { DestinationPlugin } from '../../../../domain/plugin/destination-plugin';
import { StepError } from '../../../../domain/plugin/StepError';

import * as Client from 'ssh2-sftp-client';

export const SftpDestinationSchema = z.object({
  host: z.hostname().or(z.ipv4()).or(z.ipv6()),
  port: z.number().int().positive().default(22),
  username: z.string(),
  password: z.string(),
  remotePath: z.string().startsWith('/').default('/'),
});

export type SftpDestinationOptions = z.infer<typeof SftpDestinationSchema>;

export const SftpDestinationPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration SFTP Destination
Téléverse les fichiers vers un serveur via SFTP.

**Paramètres :**
- **Connexion** : Host, Port, Username, Password.
- **Remote path** : Répertoire de destination.`,
  fields: [
    {
      name: 'host',
      label: 'Host',
      formType: 'input',
      controlType: 'control',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'port',
      label: 'Port',
      formType: 'input',
      controlType: 'control',
      inputType: 'number',
      optional: false,
      validators: [{ name: 'required' }, { name: 'min', params: 1 }],
    },
    {
      name: 'username',
      label: 'Username',
      formType: 'input',
      controlType: 'control',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'password',
      label: 'Password',
      formType: 'input',
      controlType: 'control',
      inputType: 'password',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'remotePath',
      label: 'Remote path',
      formType: 'input',
      controlType: 'control',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
      defaultValue: '/',
    },
  ],
  validators: [],
};
@Injectable()
export class SftpDestinationPluginService
  implements DestinationPlugin<SftpDestinationOptions>
{
  private $config: SftpDestinationOptions;

  initialize(init: SftpDestinationOptions): void {
    const parseResult = this.getSchema().safeParse(init);
    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.$config = parseResult.data as SftpDestinationOptions;
  }
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'sftp-destination',
      type: 'destination',
      formDefinition: SftpDestinationPluginFormDefinition,
    };
  }
  getSchema(): z.ZodSchema {
    return SftpDestinationSchema;
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
    const sftp = new Client();
    const { host, port, username, password, remotePath } = this.$config;
    try {
      await sftp.connect({ host, port, username, password, timeout: 10_000 });
    } catch (error) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        `Failed to connect to SFTP: ${error}`,
      );
    }
    for (const item of data) {
      if (item && item.file && Buffer.isBuffer(item.file)) {
        const fullPath = `${remotePath}/${item.filename}`;
        const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));

        await sftp.mkdir(dirPath, true);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await sftp.put(item.file, fullPath, {
          writeStreamOptions: {
            flags: 'w',
            encoding: 'utf-8',
            mode: 0o666,
          },
        });
      }
    }

    await sftp.end();
  }
}
