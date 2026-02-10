import { Injectable, Logger } from '@nestjs/common';
import { SourcePlugin } from '../../../../domain/plugin/source-plugin';
import { z, ZodError } from 'zod';
import { ConfigError } from '../../../../domain/plugin/ConfigError';
import * as Client from 'ssh2-sftp-client';
import { FileInfo } from 'ssh2-sftp-client';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';
import { formatISO } from 'date-fns';

export const SftpSourceSchema = z.object({
  host: z.hostname().or(z.ipv4()).or(z.ipv6()),
  port: z.number().int().positive().default(22),
  username: z.string(),
  password: z.string(),
  remotePath: z.string().startsWith('/').default('/'),
  isDir: z.boolean().optional().or(z.null()).default(false),
  filter: z.string().optional().or(z.null()).default(null),
  archived: z.boolean().optional().or(z.null()).default(false),
});

export type SftpSourceOptions = z.infer<typeof SftpSourceSchema>;

export const SftpSourcePluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration SFTP Source
Récupère des fichiers via le protocole SFTP (SSH File Transfer Protocol).

**Champs :**
- **Connexion** : Host, Port (par défaut 22), Username, Password.
- **Remote path** : Chemin absolu vers le fichier ou dossier.
- **Is directory ?** : Indique si la source est un répertoire.
- **Filter (Regex)** : Filtrage des noms de fichiers par expression régulière.
- **Archived ?** : Si coché, les fichiers traités peuvent être marqués comme archivés (selon l'implémentation).`,
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
    {
      name: 'isDir',
      label: 'Is directory ?',
      formType: 'checkbox',
      defaultValue: false,
      controlType: 'control',
      optional: false,
      validators: [],
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
  ],
  validators: [],
};

@Injectable()
export class SftpSourcePluginService
  implements SourcePlugin<SftpSourceOptions>
{
  getSchema(): z.ZodSchema {
    return SftpSourceSchema;
  }
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'sftp-source',
      type: 'source',
      formDefinition: SftpSourcePluginFormDefinition,
    };
  }

  get name() {
    return this.getPluginDefinition().name;
  }

  private options: SftpSourceOptions;

  initialize(init: SftpSourceOptions) {
    const parseResult = this.getSchema().safeParse(init);

    if (!parseResult.success) {
      throw new ZodError(parseResult.error.issues);
    }

    this.options = parseResult.data as SftpSourceOptions;
  }

  async extract(
    workflow_name: string,
    job_id: any,
    step_id: any,
  ): Promise<any[]> {
    if (!this.options) {
      throw new ConfigError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'Source options not initialized',
      );
    }

    const filesToMove = [] as { path: string; name: string; baseDir: string }[];
    const sftp = new Client();

    const { host, port, username, password, isDir, remotePath, filter } =
      this.options;

    Logger.log(
      `Connecting to SFTP server: ${host}:${port}`,
      SftpSourcePluginService.name,
    );
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
    Logger.log(
      `Connected to SFTP server: ${host}:${port}`,
      SftpSourcePluginService.name,
    );

    const rslt = [] as string[];

    try {
      if (isDir) {
        Logger.log(`Extracting files from directory: ${remotePath}`);
        const paths = await this.getAllFilePaths(sftp, remotePath);
        Logger.log(`Found ${paths.length} files in directory`);
        let files = paths;
        if (filter) {
          files = paths.filter((file) => file.item.name.match(filter));
        }
        for (const file of files) {
          Logger.log(`Extracting file: ${file.item.name}`);
          filesToMove.push({
            path: file.itemPath,
            name: file.item.name,
            baseDir: file.itemPath.substring(0, file.itemPath.lastIndexOf('/')),
          });
          const fileData = await sftp.get(file.itemPath);
          rslt.push(fileData.toString('utf8').replace(/"/gi, ''));
        }
      } else {
        const fileName = remotePath.split('/').pop() || '';
        const baseDir = remotePath.substring(0, remotePath.lastIndexOf('/'));
        filesToMove.push({ path: remotePath, name: fileName, baseDir });
        rslt.push(
          await sftp
            .get(remotePath)
            .then((c) => c.toString('utf-8').replace(/"/gi, '')),
        );
      }
    } catch (e) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        `Failed to extract files: ${e}`,
      );
    }

    try {
      if (filesToMove.length > 0 && this.options.archived) {
        try {
          const isoDate = formatISO(new Date()).replace(/:/g, '-');
          for (const file of filesToMove) {
            const archivedDir = `${file.baseDir}/archived/${isoDate}`;
            const isArchivedExist = await sftp.exists(archivedDir);
            if (!isArchivedExist) {
              await sftp.mkdir(archivedDir, true);
            }
            const newPath = `${archivedDir}/${file.name}`;
            Logger.log(`Archiving file ${file.path} to ${newPath}`);
            await sftp.rename(file.path, newPath);
          }
        } catch (e) {
          throw new StepError(
            job_id,
            workflow_name,
            step_id,
            this.name,
            `Failed to move files: ${e}`,
          );
        }
      }
      return rslt;
    } finally {
      await sftp.end();
    }
  }

  private async getAllFilePaths(sftp: Client, remotePath: string) {
    const filePaths = [] as { item: FileInfo; itemPath: string }[];
    let pattern: RegExp | undefined;
    if (this.options.filter) {
      pattern = new RegExp(this.options.filter);
    }

    const listFiles = async (path: string) => {
      const list = await sftp.list(path);
      for (const item of list) {
        const itemPath = `${path}/${item.name}`;
        if (item.type == 'd' && item.name != 'archived') {
          await listFiles(itemPath);
        } else if (item.type == '-') {
          if (pattern && pattern.test(item.name)) {
            filePaths.push({ item, itemPath });
          } else if (!pattern) {
            filePaths.push({ item, itemPath });
          }
        }
      }
    };

    await listFiles(remotePath);
    return filePaths;
  }
}
