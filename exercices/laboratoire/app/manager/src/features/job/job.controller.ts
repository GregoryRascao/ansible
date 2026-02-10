import { Body, Controller, Logger, Post } from '@nestjs/common';
import { Workflow, WorkflowStartRequest } from '@features/job/workflow.model';
import { JobService } from '@features/job/job.service';
import { HttpService } from '@nestjs/axios';

@Controller('jobs')
export class JobController {
  constructor(
    private readonly $job: JobService,
    private readonly $http: HttpService,
  ) {}

  @Post('/execute')
  executeJobAction(@Body() body: WorkflowStartRequest) {
    const job = this.$job.create(body as Workflow);
    const { job_history, job_history_steps } = this.$job.initHistory(job);

    this.$job
      .execute(job)
      .then(() => Logger.log(`Job ${job.name} start with id ${job.job_id}`))
      .catch((err) => Logger.error(err.message, JobController.name));

    return {
      job_id: job.job_id,
      job_history,
      job_history_steps,
    };
  }
}
