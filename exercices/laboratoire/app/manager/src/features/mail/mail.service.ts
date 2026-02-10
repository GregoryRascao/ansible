import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JobExecuting } from '@features/job/job.model';
import * as ejs from 'ejs';
import { format } from 'date-fns';
import { EnvService } from '@config/env/env.service';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MailService {
  constructor(
    private readonly $http: HttpService,
    private readonly $env: EnvService,
  ) {}

  async sendJobExecutionFailed(job: JobExecuting) {
    const html = await ejs.renderFile(
      path.join(__dirname, '/templates/job-execution-failed.ejs'),
      {
        workflow: job.workflowName,
        step_id: job.step_id,
        plugin_name: job.pluginName,
        date: format(new Date(), 'dd MMM yyyy HH:mm:ss'),
      },
    );

    Logger.log(html, MailService.name);

    const uri = `https://${this.$env.get('BROKER_URI')}/api/exchanges/%2F/mail/publish`;
    await lastValueFrom(
      this.$http.post(
        uri,
        {
          properties: {},
          routing_key: `mail.${this.$env.get('NODE_ENV') === 'production' ? 'send' : 'test'}`,
          payload: JSON.stringify({
            to: ['3053-GestionComptagepourtiers@memoco.eu'],
            subject: 'Waves - failed job execution',
            html,
          }),
          payload_encoding: 'string',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic YWRtaW46bWhzUFhPZE5YaW44czVlMFV0SnQ=',
          },
        },
      ),
    );
  }
}
