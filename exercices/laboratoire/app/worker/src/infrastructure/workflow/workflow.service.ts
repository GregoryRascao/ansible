import { Injectable, Logger } from '@nestjs/common';
import { BrokerConsumerService } from '../broker/services/broker-consumer.service';
import {
  BrokerService,
  ParseConsumeMessage,
} from '../broker/services/broker.service';
import { BrokerConsume } from '../broker/annotations/broker.annotation';
import { Channel } from 'amqplib';
import { ZodError } from 'zod';
import { ExecuteWorkflowUseCase } from '../../application/workflow/execute-workflow.use-case';
import { WorkflowSchema } from '../../domain/workflow/workflow.schema';
import { JobError } from '../../domain/job/JobError';
import { StepError } from '../../domain/plugin/StepError';
import { JobExecutorService } from '../job/job-executor.service';
import { BrokerWorkflowObserver } from './broker-workflow-observer';

@Injectable()
export class WorkflowService extends BrokerConsumerService {
  private readonly executeWorkflowUseCase: ExecuteWorkflowUseCase;

  constructor(
    $broker: BrokerService,
    $jobExecutor: JobExecutorService, // We still need it but as an implementation of the port
  ) {
    super($broker);
    this.executeWorkflowUseCase = new ExecuteWorkflowUseCase(
      $broker,
      $jobExecutor,
    );
    this.executeWorkflowUseCase.addObserver(
      new BrokerWorkflowObserver($broker),
    );
  }

  @BrokerConsume(
    'job',
    'topic',
    `waves-worker`,
    'quorum',
    ['waves.job.start'],
    {
      arguments: {
        'x-queue-type': 'quorum',
      },
    },
  )
  handleJob(msg: ParseConsumeMessage, channel: Channel) {
    const { fields } = msg;
    const { routingKey } = fields;
    Logger.log(`Received message on ${routingKey}`, WorkflowService.name);

    this.executeJob(msg)
      .then(() => Logger.log('Job executed', WorkflowService.name))
      .catch(async (error: Error) => {
        if (error instanceof ZodError) {
          await this.sendZodError(error);
        } else if (error instanceof StepError) {
          await this.sendStepError(error);
        } else if (error instanceof JobError) {
          await this.sendJobError(error);
        } else {
          await this.sendInternalError(error);
        }
      });
    return;
  }
  private async executeJob(workflowMsg: ParseConsumeMessage) {
    const workflow = this.parseWorkflow(workflowMsg);
    await this.executeWorkflowUseCase.execute(workflow);
  }

  private parseWorkflow(msg: ParseConsumeMessage) {
    const msgWorkflow = msg.parse;
    return WorkflowSchema.parse(msgWorkflow);
  }

  private async sendStepError(error: StepError) {
    Logger.error(error.message, WorkflowService.name);
    await this.sendJobUpdate(
      error.job_id,
      error.workflow_name,
      error.stepId,
      error.pluginName,
      'FAILED',
      error.message,
    );
    await this.sendJobUpdate(
      error.job_id,
      error.workflow_name,
      null,
      null,
      'FAILED',
      error.message,
    );
    await this.$broker.publish('error', '', {
      message: 'Job Error',
      error: {
        job_id: error.job_id,
        stepId: error.stepId,
        message: error.message,
      },
    });
  }

  private async sendJobError(error: JobError) {
    Logger.error(error.message, WorkflowService.name);
    await this.$broker.publish('error', '', {
      message: 'Job Error',
      error: {
        job_id: error.job_id,
        stepId: error.stepId,
        message: error.message,
      },
    });
  }

  private async sendZodError(error: ZodError) {
    await this.$broker.publish('error', '', {
      message: 'Invalid workflow',
      error: error.message,
    });
  }

  private async sendInternalError(error: Error) {
    Logger.error(error.message, WorkflowService.name);
    await this.$broker.publish('error', '', {
      message: 'Internal error',
      error: error.message,
    });
  }

  private async sendJobUpdate(
    job_id: string,
    workflow_name: string | null,
    stepId: string | null,
    pluginName: string | null,
    status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED',
    data?: any,
  ) {
    const msg = {
      job_id,
      worker_id: process.env.WORKER_ID,
      workflowName: workflow_name,
      step_id: stepId,
      pluginName,
      status,
    } as Record<string, any>;
    if (data) {
      msg.data = data;
    }
    await this.$broker.publish('job', 'waves.job.update', msg);
  }
}
