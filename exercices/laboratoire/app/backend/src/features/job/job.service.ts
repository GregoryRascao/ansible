import { MongoNotFoundException } from '@common/exceptions/mongo-not-found.exception';
import {
  JobExecuting,
  JobExecutingDocument,
} from '@database/schemas/job-executing.schema';
import { JobHistory } from '@database/schemas/job-history.schema';
import { JobStepHistory } from '@database/schemas/job-step-history.schema';
import { Workflow, WorkflowDocument } from '@database/schemas/workflow.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Document, Model, Types } from 'mongoose';
import { UpdateJobHistoryDto } from './job-history.dto';

export type JobHistoryDocument = Document<
  Types.ObjectId,
  object,
  JobHistory,
  object
> &
  JobHistory;

export type JobStepHistoryDocument = Document<
  Types.ObjectId,
  object,
  JobStepHistory,
  object
> &
  JobStepHistory;

@Injectable()
export class JobService {
  constructor(
    @InjectModel(JobExecuting.name)
    private readonly jobExecutingModel: Model<JobExecutingDocument>,
    @InjectModel(JobHistory.name)
    private readonly jobHistoryModel: Model<JobHistoryDocument>,
    @InjectModel(JobStepHistory.name)
    private readonly jobStepHistoryModel: Model<JobStepHistoryDocument>,
    @InjectModel(Workflow.name)
    private readonly workflowModel: Model<WorkflowDocument>,
  ) {}

  async findJobByJobId(jobId: string): Promise<JobHistoryDocument> {
    const job = await this.jobHistoryModel.findOne({ job_id: jobId }).exec();

    if (!job) {
      throw new MongoNotFoundException('error.job.notFound');
    }

    return job;
  }

  async findAllJobs(
    filters: Record<string, any> = {},
  ): Promise<JobHistoryDocument[]> {
    return await this.jobHistoryModel
      .find(filters)
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findAllJobStepsHistoryByJobId(
    jobId: string,
  ): Promise<JobStepHistoryDocument[]> {
    return await this.jobStepHistoryModel.find({ job_id: jobId }).exec();
  }

  async updatePartialJobById(
    jobId: string,
    filter: Record<string, any>,
  ): Promise<JobHistoryDocument> {
    const job = await this.jobHistoryModel
      .findOneAndUpdate({ job_id: jobId }, { $set: filter }, { new: true })
      .exec();

    if (!job) {
      throw new MongoNotFoundException('error.job.notFound');
    }

    return job;
  }

  async replaceJobById(
    jobId: string,
    entity: UpdateJobHistoryDto,
  ): Promise<JobHistoryDocument> {
    const existing = await this.jobHistoryModel
      .findOne({ job_id: jobId })
      .exec();

    if (!existing) {
      const jobHistory = await this.jobHistoryModel.create(entity);
      return jobHistory.save();
    }

    const updatedDoc = { ...existing.toObject(), ...entity };

    const job = await this.jobHistoryModel
      .findOneAndReplace({ job_id: jobId }, updatedDoc, {
        new: true,
        overwrite: true,
      })
      .exec();

    if (!job) {
      throw new MongoNotFoundException('error.job.notFound');
    }

    return job;
  }

  async updateJobById(
    jobId: string,
    entity: Partial<JobHistory>,
  ): Promise<JobHistoryDocument> {
    const existing = await this.jobHistoryModel
      .findOne({ job_id: jobId })
      .exec();

    if (!existing) {
      throw new MongoNotFoundException('error.job.notFound');
    }

    const updatedDoc = {
      ...existing.toObject(),
      ...entity,
      updatedAt: new Date(),
    };

    const job = await this.jobHistoryModel
      .findOneAndReplace({ job_id: jobId }, updatedDoc, {
        new: true,
      })
      .exec();

    return job!;
  }

  async replaceJobStep(
    jobId: string,
    stepId: string,
    entity: Partial<JobStepHistory>,
  ): Promise<JobStepHistoryDocument> {
    const filter = { job_id: jobId, step_id: stepId };

    const existing = await this.jobStepHistoryModel.findOne(filter).exec();

    if (!existing) {
      const step = await this.jobStepHistoryModel.create(entity);
      return step.save();
    }

    const updatedDoc = { ...existing.toObject(), ...entity };

    const step = await this.jobStepHistoryModel
      .findOneAndReplace(filter, updatedDoc, {
        new: true,
      })
      .exec();

    if (!step) {
      throw new MongoNotFoundException('error.step.notFound');
    }

    return step;
  }

  async removeJobExecutingByJobId(id: string): Promise<DeleteResult> {
    const result = await this.jobExecutingModel.deleteMany({
      job_id: id,
    });

    console.log({
      job_id: id,
      deleteResult: result,
    });

    if (result.deletedCount === 0) {
      throw new MongoNotFoundException(`error.jobExecuting.notFound`);
    }

    return result;
  }

  async removeJobExecutingByWorkflowId(id: string): Promise<DeleteResult> {
    const result = await this.jobExecutingModel.deleteMany({
      workflow_id: id,
    });

    console.log({
      workflow_id: id,
      deleteResult: result,
    });

    if (result.deletedCount === 0) {
      throw new MongoNotFoundException(`error.jobExecuting.notFound`);
    }

    return result;
  }

  async insertJobExecuting(
    entity: JobExecuting,
  ): Promise<JobExecutingDocument> {
    const jobExecuting = new this.jobExecutingModel(entity);

    return await jobExecuting.save();
  }

  async insertJobHistory(entity: JobHistory): Promise<JobHistoryDocument> {
    const jobHistory = new this.jobHistoryModel(entity);

    return await jobHistory.save();
  }

  async insertJobStepHistory(
    entity: JobStepHistory,
  ): Promise<JobStepHistoryDocument> {
    const jobStepHistory = new this.jobStepHistoryModel(entity);

    return await jobStepHistory.save();
  }

  async getJobsInFailedStatusCount(workflowId: string): Promise<number> {
    return await this.jobHistoryModel
      .countDocuments({
        workflow_id: workflowId,
        status: 'FAILED',
        acknowledged: false,
      })
      .exec();
  }

  async findAllExecuting() {
    const executingJob = await this.jobExecutingModel.find().exec();
    return executingJob.map((it) => it.toObject());
  }
}
