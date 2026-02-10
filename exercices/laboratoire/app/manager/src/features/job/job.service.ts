import { Injectable, Logger } from '@nestjs/common';
import { BrokerConsumerService } from '@shared/broker/services/broker-consumer.service';
import {
  BrokerService,
  ParseConsumeMessage,
} from '@shared/broker/services/broker.service';
import { BrokerConsume } from '@shared/broker/annotations/broker.annotation';
import { Channel } from 'amqplib';
import { Workflow } from '@features/job/workflow.model';
import { Job, JobExecuting, JobExecutingSchema } from '@features/job/job.model';
import { v4 as uuid4 } from 'uuid';
import { HttpService } from '@nestjs/axios';
import { EnvService } from '@config/env/env.service';
import { lastValueFrom } from 'rxjs';
import { ZodSafeParseResult } from 'zod';
import { MailService } from '@features/mail/mail.service';

@Injectable()
export class JobService extends BrokerConsumerService {
  constructor(
    $broker: BrokerService,
    private readonly $http: HttpService,
    private readonly $env: EnvService,
    private readonly $mail: MailService,
  ) {
    super($broker);
  }

  @BrokerConsume('job', 'topic', 'waves-manager-job', 'quorum', [
    'waves.job.update',
  ])
  async handleJob(message: ParseConsumeMessage) {
    Logger.log(message.parse, JobService.name);
    const job: ZodSafeParseResult<JobExecuting> = JobExecutingSchema.safeParse(
      message.parse,
    );

    try {
      if (job.success && job.data.job_id && job.data.step_id) {
        await lastValueFrom(
          this.$http.put(
            `${this.$env.get('WAVES_BACK')}/jobs/${job.data.job_id}/steps/${job.data.step_id}`,
            {
              step: job.data,
            },
          ),
        );
        if (job.data.status === 'FAILED') {
          Logger.log(
            `Sending job execution failed email for job ${job.data.job_id}`,
            JobService.name,
          );
          await this.$mail.sendJobExecutionFailed(job.data);
          Logger.log(`Email sent for job ${job.data.job_id}`, JobService.name);
        }
      } else if (job.success && job.data.job_id) {
        await lastValueFrom(
          this.$http.put(
            `${this.$env.get('WAVES_BACK')}/jobs/${job.data.job_id}`,
            {
              job: job.data,
            },
          ),
        );
      }
    } catch (error) {
      Logger.error(error.message, JobService.name);
    }
  }

  create(workflow: Workflow) {
    return {
      job_id: uuid4(),
      name: workflow.metadata.name,
      sources: workflow.steps
        .filter((step) => step.pluginType === 'source')
        .map((step) => ({
          step_id: uuid4(),
          name: step.pluginName,
          options: step.values,
        })),
      transforms: workflow.steps
        .filter((step) => step.pluginType === 'transform')
        .map((step) => ({
          step_id: uuid4(),
          name: step.pluginName,
          options: step.values,
        })),
      destinations: workflow.steps
        .filter((step) => step.pluginType === 'destination')
        .map((step) => ({
          step_id: uuid4(),
          name: step.pluginName,
          options: step.values,
        })),
    } as Job;
  }

  async execute(job: Job) {
    try {
      await this.$broker.publish('job', 'waves.job.start', job);
    } catch (error) {
      await this.$broker.publish('error', 'waves.job.error', {
        job_id: job.job_id,
        error: error.message,
      } as Record<string, any>);
      throw error;
    }
  }

  initHistory(job: Job) {
    const job_history = {
      job_id: job.job_id,
      step_id: null,
      pluginName: null,
      status: 'PENDING',
    };
    const steps = [] as Array<Record<string, any>>;

    for (const step of [
      ...job.sources,
      ...job.transforms,
      ...job.destinations,
    ]) {
      steps.push({
        job_id: job.job_id,
        step_id: step.step_id,
        pluginName: step.name,
        status: 'PENDING',
        data: [],
      });
    }

    return {
      job_history,
      job_history_steps: steps,
    };
  }
}
