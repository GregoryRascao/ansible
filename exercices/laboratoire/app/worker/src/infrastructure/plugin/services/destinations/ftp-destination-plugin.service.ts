import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { DestinationPlugin } from '../../../../domain/plugin/destination-plugin';
import { StepError } from '../../../../domain/plugin/StepError';
import { Client } from 'basic-ftp';
import { Readable } from 'node:stream';

export const FtpDestinationSchema = z.object({
  host: z.hostname().or(z.ipv4()).or(z.ipv6()),
  port: z.number().int().positive().default(22),
  username: z.string(),
  password: z.string(),
  remotePath: z.string().startsWith('/').default('/'),
  isDir: z.boolean().default(false),
  filter: z.string().optional().or(z.null()).default(null),
  archived: z.boolean().default(false),
  secured: z.boolean().default(false),
});
export type FtpDestinationPluginConfig = z.infer<typeof FtpDestinationSchema>;

export const FtpDestinationPluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration FTP Destination
Envoie les fichiers générés vers un serveur FTP.

**Paramètres :**
- **Connexion** : Host, Port, Username, Password.
- **Remote path** : Répertoire de destination sur le serveur.
- **Secured ?** : Utiliser FTPS.`,
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
      inputType: 'text',
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
    {
      name: 'filter',
      label: 'Filter (Regex)',
      formType: 'input',
      controlType: 'control',
      inputType: 'text',
      optional: true,
      validators: [],
    },
    {
      name: 'archived',
      label: 'Archived ?',
      formType: 'checkbox',
      defaultValue: false,
      controlType: 'control',
      optional: true,
      validators: [],
    },
    {
      name: 'secured',
      label: 'Secured ?',
      formType: 'checkbox',
      defaultValue: false,
      controlType: 'control',
      optional: true,
      validators: [],
    },
  ],
  validators: [],
};
@Injectable()
export class FtpDestinationPluginService
  implements DestinationPlugin<FtpDestinationPluginConfig>
{
  private $config: FtpDestinationPluginConfig;
  initialize(init: FtpDestinationPluginConfig): void {
    const parseResult = this.getSchema().safeParse(init);
    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.$config = parseResult.data as FtpDestinationPluginConfig;
  }
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'ftp-destination',
      type: 'destination',
      formDefinition: FtpDestinationPluginFormDefinition,
    };
  }
  getSchema(): z.ZodSchema {
    return FtpDestinationSchema;
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
        'FtpDestination configuration not provided.',
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

    const client = new Client();
    const { host, port, username, password, secured, remotePath } =
      this.$config;

    try {
      await client.access({
        host,
        port,
        user: username,
        password,
        secure: secured,
      });
      const sendPromises = data
        .filter((item) => item && item.file && Buffer.isBuffer(item.file))
        .map(async (item) => {
          const fullPath = `${remotePath}/${item.filename}`;
          const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));

          await client.ensureDir(dirPath);
          await client.cd(remotePath);

          const stream = Readable.from(item.file);
          await client.uploadFrom(stream, fullPath);
        });

      await Promise.all(sendPromises);
    } catch (e) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        `Failed to connect to FTP: ${e}`,
      );
    } finally {
      client.close();
    }
  }
}
