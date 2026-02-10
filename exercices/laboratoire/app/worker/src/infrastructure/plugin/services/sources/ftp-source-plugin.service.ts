import { Injectable } from '@nestjs/common';
import { Client } from 'basic-ftp';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs/promises';
import { SourcePlugin } from '../../../../domain/plugin/source-plugin';
import { z, ZodType } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';

export const FtpSourceSchema = z.object({
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

export type FtpSourcePluginConfig = z.infer<typeof FtpSourceSchema>;

export const FtpSourcePluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration FTP Source
Permet de télécharger des fichiers depuis un serveur FTP.

**Options :**
- **Host / Port / Username / Password** : Connexion au serveur.
- **Remote path** : Chemin vers le fichier ou le dossier sur le serveur.
- **Filter (Regex)** : Expression régulière pour filtrer les fichiers à télécharger.
- **Is directory ?** : Cochez si le chemin distant est un dossier.
- **Secured ?** : Utiliser une connexion sécurisée (FTPS).`,
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

async function getContent(ftp: Client, filename: string) {
  const tempFilePath = path.join(os.tmpdir(), 'ftp_download_' + Date.now());
  await ftp.downloadTo(tempFilePath, filename);
  const str = await fs.readFile(tempFilePath, 'utf-8');
  await fs.unlink(tempFilePath);

  return str;
}

async function getDirContent(ftp: Client, path: string, filter?: string) {
  let list = await ftp.list(path);
  if (filter) {
    list = list.filter((f) => f.name.includes(filter));
  }
  const rslt = [] as string[];

  for (const file of list) {
    if (file.isDirectory) {
      rslt.push(...(await getDirContent(ftp, `${path}/${file.name}`, filter)));
    } else {
      rslt.push(await getContent(ftp, `${path}/${file.name}`));
    }
  }

  return rslt;
}

@Injectable()
export class FtpSourcePluginService
  implements SourcePlugin<FtpSourcePluginConfig>
{
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'ftp-source',
      type: 'source',
      formDefinition: FtpSourcePluginFormDefinition,
    };
  }
  getSchema(): ZodType {
    return FtpSourceSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }
  private config: FtpSourcePluginConfig;

  initialize(config: FtpSourcePluginConfig): void {
    this.config = config;
  }

  async extract(
    workflow_name: string,
    job_id: any,
    step_id: any,
  ): Promise<string[]> {
    if (!this.config) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'Sftp configuration not provided.',
      );
    }
    const ftp = new Client();
    const { host, port, username, password, remotePath, isDir } = this.config;
    await ftp.access({ host, port, user: username, password });

    const rslt = [] as string[];
    if (isDir) {
      rslt.push(...(await getDirContent(ftp, remotePath)));
    } else {
      rslt.push(await getContent(ftp, remotePath));
    }

    try {
      return await Promise.all(rslt);
    } catch (e) {
      throw e;
    } finally {
      ftp.close();
    }
  }

  validate(data: any[]): boolean {
    throw new Error('Method not implemented.');
  }
}
