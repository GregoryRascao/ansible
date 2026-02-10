import { MongoNotFoundException } from '@common/exceptions/mongo-not-found.exception';
import { JobStepHistory } from '@database/schemas/job-step-history.schema';
import {
  QueryJobHistoryDto,
  UpdateJobHistoryDto,
  UpdateJobHistorySchema,
} from '@features/job/job-history.dto';
import { CreateJobStepHistoryDto } from '@features/job/job-step-history.dto';
import { JobService } from '@features/job/job.service';
import { WorkflowService } from '@features/workflow/workflow.service';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  PreconditionFailedException,
  Put,
  Query,
} from '@nestjs/common';
import { MongooseError } from 'mongoose';
import { Public } from 'nest-keycloak-connect';
import { WorkflowGateway } from '@features/workflow/workflow.gateway';
import { endOfDay, startOfDay } from 'date-fns';

@Controller('jobs')
export class JobController {
  constructor(
    private readonly $job: JobService,
    private readonly $workflow: WorkflowService,
    private readonly $ws: WorkflowGateway,
  ) {}

  @Get()
  async findAllJobsAction(@Query() query: QueryJobHistoryDto) {
    if (!query) {
      return await this.$job.findAllJobs();
    }

    const filters: Record<string, any> = {};

    if (query.workflowName) {
      const workflow = await this.$workflow.findOneByName(query.workflowName);

      if (workflow) {
        filters['workflow_id'] = workflow.id;
      }
    }

    if (query.workflow_id) {
      filters['workflow_id'] = query.workflow_id;
    }

    if (query.startAt && query.endAt) {
      filters['updatedAt'] = {
        $gte: startOfDay(new Date(query.startAt)),
        $lte: endOfDay(new Date(query.endAt)),
      };
    }

    if (query.startAt) {
      filters['updatedAt'] = { $gte: startOfDay(new Date(query.startAt)) };
    }

    if (query.endAt) {
      filters['updatedAt'] = { $lte: endOfDay(new Date(query.endAt)) };
    }

    if (query.acknowledged !== undefined) {
      filters['acknowledged'] = query.acknowledged;
    }

    const jobs = await this.$job.findAllJobs(filters);
    const workflows = await this.$workflow.findAll();

    const jobWithWorkflowName = jobs.map((job) => {
      const workflow = workflows.find(
        (wf) => wf._id.toString() === job.workflow_id,
      );
      return {
        ...job.toObject(),
        workflowName: workflow ? workflow.metadata.name : null,
      };
    });

    return jobWithWorkflowName;
  }

  @Get(':job_id/steps')
  async findAllStepsAction(@Param('job_id') jobId: string) {
    return await this.$job.findAllJobStepsHistoryByJobId(jobId);
  }

  @Patch(':job_id/acknowledged')
  async acknowledgeAction(@Param('job_id') jobId: string) {
    try {
      return await this.$job.updatePartialJobById(jobId, {
        acknowledged: true,
      });
    } catch (error) {
      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.job.unableToUpdate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':job_id')
  async findOneJobAction(@Param('job_id') jobId: string) {
    try {
      return await this.$job.findJobByJobId(jobId);
    } catch (error) {
      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Public()
  @Put(':job_id')
  async replaceJobAction(
    @Param('job_id') jobId: string,
    @Body('job') body: any,
  ) {
    const updateJob = UpdateJobHistorySchema.safeParse(body);

    if (!updateJob.success) {
      // FIX: 'errors' ne s affiche pas
      throw new PreconditionFailedException({
        errors: JSON.stringify(updateJob.error.issues),
        message: 'error.job.parametersMismatchDTO',
      });
    }

    try {
      if (
        updateJob.data.status === 'SUCCESS' ||
        updateJob.data.status === 'FAILED'
      ) {
        console.log({ jobId, job: body });
        await this.$job.removeJobExecutingByJobId(updateJob.data.job_id!);
        this.$ws.stopEmit({ workflowName: body.workflowName });
      }
    } catch (error) {
      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }

    try {
      return await this.$job.replaceJobById(jobId, updateJob.data);
    } catch (error) {
      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.job.unableToUpdate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Public()
  @Patch(':job_id')
  async updateJobPartialAction(
    @Param('job_id') jobId: string,
    @Body() job: UpdateJobHistoryDto,
  ) {
    // const job = body.toEntity();

    try {
      return await this.$job.updateJobById(jobId, job);
    } catch (error) {
      console.log(jobId);
      console.log(job);

      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.job.unableToUpdate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Public()
  @Put(':job_id/steps/:step_id')
  async replaceStepAction(
    @Param('job_id') jobId: string,
    @Param('step_id') stepId: string,
    @Body('step') step: CreateJobStepHistoryDto,
  ) {
    // const step = body.toEntity();

    const jobStepHistory = {
      job_id: jobId,
      step_id: stepId,
      worker_id: step.worker_id,
      workflowName: step.workflowName,
      pluginName: step.pluginName,
      executionStatus: step.status,
      data: step.data,
    } as Partial<JobStepHistory>;

    try {
      return await this.$job.replaceJobStep(jobId, stepId, jobStepHistory);
    } catch (error) {
      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.step.unableToUpdate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
