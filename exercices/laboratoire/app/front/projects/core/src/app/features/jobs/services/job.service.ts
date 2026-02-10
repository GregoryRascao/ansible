import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {JobHistoryModel, JobStepHistoryModel} from '@features/jobs/models/job.model';
import {environment} from '@core/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private $http = inject(HttpClient)

  getAll(startAt: Date, endAt: Date) {
    const params = new HttpParams()
      .set('startAt', startAt.toISOString())
      .set('endAt', endAt.toISOString())
      .set('acknowledged', false)

    return lastValueFrom(this.$http.get<JobHistoryModel[]>(`${environment.uri}/jobs`, {params}))
  }

  getAllByWorkflow(workflowName: string, acknowledged: boolean, startAt: Date, endAt: Date) {
    const params = new HttpParams()
      .set('workflowName', workflowName)
      .set('acknowledged', acknowledged)
    if (environment.mode == 'dev') {
      params
        .set('startAt', startAt.toISOString())
        .set('endAt', endAt.toISOString())
    }

    return lastValueFrom(this.$http.get<JobHistoryModel[]>(`${environment.uri}/jobs`, {params}))
  }

  getStepsHistory(jobId: string) {
    return lastValueFrom(this.$http.get<JobStepHistoryModel[]>(`${environment.uri}/jobs/${jobId}/steps/`))
  }

  acknowledged(jobId: string) {
    return lastValueFrom(this.$http.patch(`${environment.uri}/jobs/${jobId}/acknowledged`, {}))
  }

  updateJob(job: JobHistoryModel) {
    return lastValueFrom(this.$http.put(`${environment.uri}/jobs/${job._id}`, job))
  }
}
