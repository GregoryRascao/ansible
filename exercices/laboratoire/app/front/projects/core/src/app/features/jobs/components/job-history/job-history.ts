import {Component, inject, input, resource} from '@angular/core';
import {DialogService} from 'primeng/dynamicdialog';
import {JobService} from '@features/jobs/services/job.service';
import {TranslatePipe} from '@ngx-translate/core';
import {Button} from 'primeng/button';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Card} from 'primeng/card';
import {DatePipe} from '@angular/common';
import {JobHistoryModel, JobStepHistoryModel} from '@features/jobs/models/job.model';
import {endOfWeek, startOfWeek} from 'date-fns';
import {JobStepHistory} from '@features/jobs/components/job-step-history/job-step-history';
import {AppStore} from '@core/src/app/app-store';

@Component({
  selector: 'job-history',
  imports: [TranslatePipe, Button, ProgressSpinner, Card, DatePipe],
  templateUrl: './job-history.html',
  styleUrl: './job-history.css',
  providers: [DialogService],
})
export class JobHistory {
  private $app = inject(AppStore);
  private $job = inject(JobService);
  private $dialog = inject(DialogService);

  workflowName = input<string>('');
  acknowledged = input<boolean>(false);
  startAt = input<Date>(startOfWeek(new Date(), {weekStartsOn: 1}));
  endAt = input<Date>(endOfWeek(new Date(), {weekStartsOn: 1}));

  jobResource = resource({
    params: () => ({
      workflowName: this.workflowName(),
      startAt: this.startAt(),
      endAt: this.endAt(),
      acknowledged: this.acknowledged(),
    }),
    loader: async ({params}) => {
      if (params.workflowName && params.startAt && params.endAt) {
        return this.$job.getAllByWorkflow(
          params.workflowName,
          params.acknowledged,
          params.startAt,
          params.endAt
        );
      } else if (params.startAt && params.endAt) {
        return this.$job.getAll(params.startAt, params.endAt);
      } else {
        return [];
      }
    },
    defaultValue: [],
  });
  // jobResource = this.$job.getAllByWorkflow(this.workflowName(), this.acknowledged(), this.startAt(), this.endAt())

  jobs = this.jobResource.value;

  acknowledgeAll() {
    const jobs = this.jobs().map((it) => ({...it, acknowledged: true}));

    Promise.all(jobs.map(it => this.$job.acknowledged(it.job_id)))
      .then(() => this.jobResource.reload())
      .catch(e => this.$app.showError(e));
  }

  viewJobStep(job: JobHistoryModel) {
    this.$job
      .getStepsHistory(job.job_id)
      .then((steps) => this.openViewStep(steps))
      .catch((e) => this.$app.showError(e));
  }

  acknowledgeJob(event: MouseEvent, job: JobHistoryModel) {
    event.stopPropagation();
    job.acknowledged = true;

    this.$job
      // .updateJob(job)
      .acknowledged(job.job_id)
      .then(() => this.jobResource.reload())
      .catch((e) => this.$app.showError(e));
  }

  private openViewStep(steps: JobStepHistoryModel[]) {
    this.$dialog.open(JobStepHistory, {
      header: 'Job Steps - history',
      closable: true,
      modal: true,
      dismissableMask: true,
      inputValues: {steps},
    });
  }
}
