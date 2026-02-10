import {Component, model} from '@angular/core';
import {JobHistory} from '@features/jobs/components/job-history/job-history';
import {DatePicker} from 'primeng/datepicker';
import {Panel} from 'primeng/panel';
import {FormsModule} from '@angular/forms';
import {endOfWeek, startOfWeek} from 'date-fns';

@Component({
  selector: 'job',
  imports: [
    JobHistory,
    DatePicker,
    Panel,
    FormsModule
  ],
  templateUrl: './job.html',
  styleUrl: './job.css'
})
export class Job {
  startAt = model(startOfWeek(new Date()))
  endAt = model(endOfWeek(new Date()))
}
