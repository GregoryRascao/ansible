import { MongoNotFoundException } from '@common/exceptions/mongo-not-found.exception';
import { CronService } from '@features/cron/cron.service';
import { JobService } from '@features/job/job.service';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { MongooseError } from 'mongoose';
import { Public } from 'nest-keycloak-connect';
import { WorkflowSocketService } from './workflow-socket.service';
import {
  BodyWorkflowDto,
  CreateWorkflowDto,
  QueryWorkflowDto,
  UpdateWorkflowDto,
} from './workflow.dto';
import { WorkflowDocument, WorkflowService } from './workflow.service';

@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly $workflow: WorkflowService,
    private readonly $job: JobService,
    private readonly $cron: CronService,
    private readonly $workflowSocket: WorkflowSocketService,
  ) {}

  @Public()
  @Get()
  async findAllAction(@Query() query: QueryWorkflowDto) {
    let workflows: WorkflowDocument[] = [];

    if (!query.archived) {
      workflows = await this.$workflow.findAll();
    } else {
      const filter = {} as Record<string, any>;

      filter['auditing.archived'] = query.archived;

      workflows = await this.$workflow.findAll(filter);
    }

    const executingJobs = await this.$job.findAllExecuting();

    for (const workflow of workflows) {
      const workflow_id = workflow.id.toString();
      const jobs: any[] = await this.$job.findAllJobs({
        workflow_id: workflow_id,
      });

      workflow.metadata['nbJobInFailedStatus'] = jobs.filter(
        (job) => job.status === 'FAILED' && job.acknowledged === false,
      ).length;
      workflow.running = executingJobs.some(
        (it) => it.workflow_id === workflow.id,
      );
      workflow.metadata['lastExecutionStatus'] = jobs[0]?.status;
      workflow.metadata['lastExecutionDate'] = jobs[0]?.updatedAt;
    }

    return workflows;
  }

  @Get(':id')
  async findOneAction(@Param('id') id: string) {
    try {
      return await this.$workflow.findOneById(id);
    } catch (error) {
      Logger.error(
        `Unable to find Workflow with id "${id}": ${error.message}`,
        WorkflowController.name,
      );

      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Post()
  async createAction(@Req() request: any, @Body() body: CreateWorkflowDto) {
    try {
      const username =
        body.auditing.createdBy ??
        request.user.name ??
        // request.user.preferred_username ??
        request.user.client_id;

      const workflow = await this.$workflow.create({
        metadata: { ...body.metadata },
        steps: [...body.steps],
        auditing: {
          ...body.auditing,
          createdBy: username,
          updatedBy: username,
        },
        running: false,
      });

      if (workflow.metadata.cronExpression) {
        const cronJob = this.$cron.createCronJob(
          workflow._id.toString(),
          workflow.metadata.cronExpression,
          async () => {
            await this.$workflow.executeJob(workflow);
          },
        );

        if (workflow.auditing.active) {
          cronJob.start();
        }
      }

      this.$workflowSocket.new(workflow);

      return workflow;
    } catch (error) {
      Logger.error(
        `Unable to create Workflow: ${error.message}`,
        WorkflowController.name,
      );

      if (error instanceof MongooseError) {
        throw new ConflictException('error.workflow.unableToCreate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Put(':id')
  async replaceAction(
    @Req() request: any,
    @Param('id') id: string,
    @Body() body: UpdateWorkflowDto,
  ) {
    try {
      const workflow = await this.$workflow.replaceById(id, {
        metadata: body.metadata,
        steps: body.steps,
        auditing: {
          ...body.auditing,
          createdBy: body.auditing.createdBy
            ? body.auditing.createdBy
            : request.user.client_id,
          updatedBy: request.user.client_id,
        },
      });

      this.$workflowSocket.update(workflow);

      return workflow;

      // TODO: if auditing.active === true => delete if existing cron job and create new cron job and start it after that
    } catch (error) {
      Logger.error(
        `Unable to update Workflow with id "${id}": ${error.message}`,
        WorkflowController.name,
      );

      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.workflow.unableToCreate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id/start')
  async startAction(@Param('id') id: string) {
    let workflow: WorkflowDocument;

    try {
      workflow = await this.$workflow.updatePartialById(id, {
        'auditing.active': true,
      });
    } catch (error) {
      Logger.error(
        `Unable to update Workflow with id "${id}": ${error.message}`,
        WorkflowController.name,
      );

      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.workflow.unableToCreate');
      }

      throw new InternalServerErrorException(error.message);
    }

    // TODO: review this part. Why startCronJob()? this never should be happen
    // TODO: ne pas authoriser l execution de workflow sans steps ? --> normalement c est déjà le cas

    if (!workflow.metadata.cronExpression) {
      Logger.warn(
        `Workflow with ID "${id}" has no cron expression defined. Skipping cron job execution....`,
        WorkflowController.name,
      );

      throw new ConflictException('error.workflow.unableToStart');
    }

    if (this.$cron.isCronJobExists(workflow._id.toString())) {
      await this.$cron.startCronJob(
        workflow._id.toString(),
        workflow.metadata.cronExpression,
        async () => {
          await this.$workflow.executeJob(workflow);
        },
      );
    } else {
      const cronJob = this.$cron.createCronJob(
        workflow._id.toString(),
        workflow.metadata.cronExpression,
        async () => {
          await this.$workflow.executeJob(workflow);
        },
      );

      cronJob.start();
    }

    this.$workflowSocket.play(workflow);

    return workflow;
  }

  @Patch(':id/stop')
  async stopAction(@Param('id') id: string) {
    let workflow: WorkflowDocument;

    try {
      workflow = await this.$workflow.updatePartialById(id, {
        'auditing.active': false,
      });
    } catch (error) {
      Logger.error(
        `Unable to update Workflow with id "${id}": ${error.message}`,
        WorkflowController.name,
      );

      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException('error.workflow.notFound');
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.workflow.unableToCreate');
      }

      throw new InternalServerErrorException(error.message);
    }

    const isDeleted = await this.$cron.deleteCronJob(id);

    if (isDeleted) {
      workflow = await this.$workflow.updatePartialById(id, {
        running: false,
      });
    }

    try {
      await this.$job.removeJobExecutingByWorkflowId(id);

      Logger.log(
        `The Job linked to Workflow ID "${id}" was removed from jobs_executing`,
        WorkflowController.name,
      );
    } catch (error) {
      Logger.warn(
        `Job linked to Workflow ID "${id}" was not found @ jobs_executing : ${JSON.stringify(error.message)}`,
        WorkflowController.name,
      );
    }

    this.$workflowSocket.stop(workflow);

    return workflow;
  }

  @Patch(':id/once')
  async onceAction(@Param('id') id: string) {
    try {
      const workflow = await this.$workflow.findOneById(id);

      await this.$workflow.executeJob(workflow);

      this.$workflowSocket.start(workflow);

      return workflow;
    } catch (error) {
      Logger.error(
        `Unable to complete the process of running once a Workflow with id "${id}": ${error.message}`,
        WorkflowController.name,
      );

      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id/archived')
  async archivedAction(@Param('id') id: string, @Body() body: BodyWorkflowDto) {
    let workflow: WorkflowDocument;

    try {
      workflow = await this.$workflow.findOneById(id);
    } catch (error) {
      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }

    if (workflow.auditing.archived && body.archived) {
      Logger.log(
        `Workflow with ID "${workflow.id}" already archived: ${workflow.auditing.archived}. Nothing to change.`,
        WorkflowController.name,
      );

      this.$workflowSocket.update(workflow);

      return workflow;
    }

    const isDeleted = await this.$cron.deleteCronJob(workflow._id.toString());

    if (isDeleted) {
      try {
        await this.$job.removeJobExecutingByWorkflowId(workflow._id.toString());

        Logger.log(
          `The Job linked to Workflow ID "${workflow._id.toString()}" was removed from jobs_executing`,
          WorkflowController.name,
        );
      } catch (error) {
        Logger.warn(
          `Job linked to Workflow ID "${workflow._id.toString()}" was not found @ jobs_executing : ${JSON.stringify(error.message)}`,
          WorkflowController.name,
        );
      }
    }

    try {
      const workflow = await this.$workflow.updatePartialById(id, {
        'auditing.archived': body.archived,
        'auditing.active': false,
      });

      this.$workflowSocket.update(workflow);

      return workflow;
    } catch (error) {
      Logger.error(
        `Unable to update Workflow with id "${id}": ${error.message}`,
        WorkflowController.name,
      );

      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException('error.workflow.notFound');
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.workflow.unableToUpdate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
