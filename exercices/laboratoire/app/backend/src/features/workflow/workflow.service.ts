import { MongoNotFoundException } from '@common/exceptions/mongo-not-found.exception';
import { EnvService } from '@config/env/env.service';
import { Workflow } from '@database/schemas/workflow.schema';
import { JobService } from '@features/job/job.service';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, FilterQuery, Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { CronService } from '@features/cron/cron.service';

export type WorkflowDocument = Document<
  Types.ObjectId,
  object,
  Workflow,
  object
> &
  Workflow;

@Injectable()
export class WorkflowService {
  constructor(
    @InjectModel(Workflow.name)
    private readonly model: Model<Workflow>,
    private readonly $http: HttpService,
    private readonly $job: JobService,
    private readonly $env: EnvService,
    private readonly $cron: CronService,
  ) {}

  async init() {
    const workflows = await this.model.find({
      'auditing.active': true,
    });

    for (const workflow of workflows) {
      if (
        workflow.auditing.active &&
        this.$cron.isCronJobExists(workflow.metadata.name)
      ) {
        await this.$cron.deleteCronJob(workflow.metadata.name);
      }

      if (workflow.auditing.active && workflow.metadata.cronExpression) {
        const job = this.$cron.createCronJob(
          workflow.metadata.name,
          workflow.metadata.cronExpression,
          async () => this.executeJob(workflow),
        );
        job.start();
      }
    }
  }

  async findOneById(id: string): Promise<WorkflowDocument> {
    const workflow = await this.model.findById(id).exec();

    if (!workflow) {
      throw new MongoNotFoundException('error.workflow.notFound');
    }

    return workflow;
  }

  async findAll(
    filters: FilterQuery<WorkflowDocument> = {},
  ): Promise<WorkflowDocument[]> {
    return await this.model.find(filters).exec();
  }

  async findOneByName(name: string): Promise<WorkflowDocument> {
    const workflow = await this.model.findOne({ 'metadata.name': name }).exec();

    if (!workflow) {
      throw new MongoNotFoundException('error.workflow.notFound');
    }

    return workflow;
  }

  async create(entity: Workflow): Promise<WorkflowDocument> {
    const workflow = new this.model(entity);
    await workflow.save();
    return workflow;
  }

  async replaceById(
    id: string,
    entity: Partial<Workflow>,
  ): Promise<WorkflowDocument> {
    // FIX: createdAt & updatedAt will contain da same time instead of keeping da time of createdAt and just update updatedAt
    const workflow = await this.model
      .findOneAndUpdate({ _id: id }, { $set: entity }, { new: true })
      .exec();

    if (!workflow) {
      throw new MongoNotFoundException('error.workflow.notFound');
    }

    return workflow;
  }

  async updatePartialById(
    id: string,
    filter: Record<string, any>,
  ): Promise<WorkflowDocument> {
    const workflow = await this.model
      .findOneAndUpdate({ _id: id }, { $set: filter }, { new: true })
      .exec();

    if (!workflow) {
      throw new MongoNotFoundException('error.workflow.notFound');
    }

    return workflow;
  }

  // ***************************************************************************************
  async executeJob(workflow: WorkflowDocument): Promise<boolean> {
    let response;

    try {
      // TODO: do it using da ConfigService
      const apiManagerURL =
        this.$env.get('WORKERS_MANAGER_SERVICE_URL') + '/api/jobs/execute';

      Logger.log(
        `Calling the Service Manager: POST ${apiManagerURL}`,
        WorkflowService.name,
      );

      const headers = { 'Content-Type': 'application/json' };
      const body = {
        id: workflow.id,
        metadata: {
          name: workflow.metadata.name,
          description: workflow.metadata.description,
          cronExpression: workflow.metadata.cronExpression,
          folder: workflow.metadata.folder,
          lastExecutionDate: new Date().toISOString(), // TODO: FOV attend lastExecutionDate: string @ metadata???
        },
        steps: workflow.steps,
      };

      response = await firstValueFrom(
        this.$http.post(apiManagerURL, body, {
          headers,
        }),
      );
    } catch (error) {
      Logger.error(
        `Error calling the Service Manager: ${JSON.stringify(error.message)}`,
        WorkflowService.name,
      );

      throw new InternalServerErrorException(error.message);
    }

    if (
      !response.data ||
      !response.data.job_history ||
      !response.data.job_history_steps
    ) {
      return false;
    }

    await this.updatePartialById(workflow.id as string, { running: true });

    // Job Executing
    try {
      const jobExecuting = {
        job_id: response.data.job_history.job_id,
        workflow_id: workflow.id,
        status: response.data.job_history.status,
        startedAt: new Date(),
      };

      await this.$job.insertJobExecuting(jobExecuting);
      Logger.log(
        `Logged job with job_id "${jobExecuting.job_id}" into jobs_executing`,
        WorkflowService.name,
      );
    } catch (error) {
      Logger.error(
        `Error inserting job into jobs_executing: ${JSON.stringify(error.message)}`,
        WorkflowService.name,
      );

      throw new Error(
        `Error inserting job into jobs_executing: ${JSON.stringify(error.message)}`,
      );
    }

    // Job History
    try {
      const jobHistory = {
        job_id: response.data.job_id,
        workflow_id: workflow.id,
        status: response.data.job_history.status,
        acknowledged: false,
      };

      await this.$job.insertJobHistory(jobHistory);
      Logger.log(
        `Logged job with job_id "${jobHistory.job_id}" into jobs_history`,
        WorkflowService.name,
      );
    } catch (error) {
      Logger.error(
        `Error inserting into jobs_history: ${JSON.stringify(error.message)}`,
        WorkflowService.name,
      );

      throw new Error(
        `Error inserting into jobs_history: ${JSON.stringify(error.message)}`,
      );
    }

    // Job Steps History
    for (const jobHistoryStep of response.data.job_history_steps) {
      try {
        const jobStepHistoryData = {
          job_id: jobHistoryStep.job_id,
          step_id: jobHistoryStep.step_id,
          pluginName: jobHistoryStep.pluginName,
          workflow_id: workflow.id,
          executionStatus: jobHistoryStep.status,
          data: jobHistoryStep.data,
        };

        await this.$job.insertJobStepHistory(jobStepHistoryData);
        Logger.log(
          `Logged step with step_id "${jobStepHistoryData.step_id}" (job_id "${jobStepHistoryData.job_id}") into job_steps_history`,
          WorkflowService.name,
        );
      } catch (error) {
        Logger.error(
          `Error inserting into job_steps_history: ${JSON.stringify(error.message)}`,
          WorkflowService.name,
        );

        throw new Error(
          `Error inserting into job_steps_history: ${JSON.stringify(error.message)}`,
        );
      }
    }

    return true;
  }
}
