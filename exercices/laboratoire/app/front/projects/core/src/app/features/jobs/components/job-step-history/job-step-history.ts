import {Component, input} from '@angular/core';
import {JobStepHistoryModel} from '@features/jobs/models/job.model';
import {TableModule} from 'primeng/table';
import {Timeline} from 'primeng/timeline';
import {DatePipe, JsonPipe} from '@angular/common';

@Component({
  selector: 'job-step-history',
  imports: [
    TableModule,
    Timeline,
    JsonPipe,
    DatePipe
  ],
  templateUrl: './job-step-history.html',
  styleUrl: './job-step-history.css'
})
export class JobStepHistory {
  steps = input.required<JobStepHistoryModel[]>()
}
