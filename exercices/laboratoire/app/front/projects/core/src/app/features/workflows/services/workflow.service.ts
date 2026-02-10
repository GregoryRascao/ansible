import {inject, Injectable, Signal} from '@angular/core';
import {httpResource, HttpResourceOptions} from '@angular/common/http';
import {environment} from '@core/src/environments/environment';
import {WorkflowState} from '@features/workflows/workflow-store';
import {httpMutation, HttpMutationOptions,} from '@angular-architects/ngrx-toolkit';
import {ParamMap} from '@angular/router';
import {MessageService} from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private $message = inject(MessageService);

  // async getAll(archived = false) {
  //   const params = new HttpParams().set('archived', archived.toString())
  //   return lastValueFrom(this.$http.get<WorkflowState[]>(`${environment.uri}/workflows`, {params}))
  // }
  getAll(
    archived: boolean = false,
    options?: HttpResourceOptions<WorkflowState[], any>
  ) {
    return httpResource(
      () => ({
        url: `${environment.uri}/workflows`,
        params: {archived},
        method: 'GET',
      }),
      {
        defaultValue: [] as WorkflowState[],
        ...options,
        parse: (response: unknown) => {
          const workflows = response as WorkflowState[];

          return workflows
            .filter((it) => it.auditing.archived === archived)
            .map(
              (it) =>
                ({
                  ...it,
                  metadata: {
                    ...it.metadata,
                    folder: it.metadata.folder || 'unknown',
                  },
                } as WorkflowState)
            );
        },
      }
    );
  }

  // async getOne(name: string) {
  //   return lastValueFrom(this.$http.get<WorkflowState>(`${environment.uri}/workflows/${name}`))
  // }
  getOne(
    params: Signal<ParamMap>,
    options?: HttpResourceOptions<WorkflowState, any>
  ) {
    return httpResource(
      () => ({
        url: `${environment.uri}/workflows/${params().get('name')}`,
      }),
      {
        defaultValue: {} as WorkflowState,
        ...options,
      }
    );
  }

  addWorkflow(
    options: Partial<HttpMutationOptions<WorkflowState, WorkflowState>> = {}
  ) {
    return httpMutation({
      ...options,
      request: (workflow: WorkflowState) => ({
        url: `${environment.uri}/workflows`,
        method: 'POST',
        body: workflow,
      }),
      parse: (response: unknown) => {
        const workflow = response as WorkflowState;

        return {
          ...workflow,
          metadata: {
            ...workflow.metadata,
            folder: workflow.metadata.folder || 'unknown',
          },
        } as WorkflowState;
      },
    });
  }

  updateWorkflow(
    options: Partial<HttpMutationOptions<WorkflowState, WorkflowState>> = {}
  ) {
    return httpMutation({
      request: (workflow: WorkflowState) => ({
        url: `${environment.uri}/workflows/${workflow._id}`,
        method: 'PUT',
        body: workflow,
      }),
      parse: (response: unknown) => {
        const workflow = response as WorkflowState;

        return {
          ...workflow,
          metadata: {
            ...workflow.metadata,
            folder: workflow.metadata.folder || 'unknown',
          },
        } as WorkflowState;
      },
    });
  }

  startWorkflow() {
    return httpMutation({
      request: (workflow: WorkflowState) => ({
        url: `${environment.uri}/workflows/${workflow._id}/start`,
        method: 'PATCH',
      }),
      parse: (response: unknown) => {
        const workflow = response as WorkflowState;

        return {
          ...workflow,
          metadata: {
            ...workflow.metadata,
            folder: workflow.metadata.folder || 'unknown',
          },
        } as WorkflowState;
      },
    });
  }

  stopWorkflow() {
    return httpMutation({
      request: (workflow: WorkflowState) => ({
        url: `${environment.uri}/workflows/${workflow._id}/stop`,
        method: 'PATCH',
      }),
      parse: (response: unknown) => {
        const workflow = response as WorkflowState;

        return {
          ...workflow,
          metadata: {
            ...workflow.metadata,
            folder: workflow.metadata.folder || 'unknown',
          },
        } as WorkflowState;
      },
    });
  }

  executeOnceWorkflow() {
    return httpMutation({
      request: (workflow: WorkflowState) => ({
        url: `${environment.uri}/workflows/${workflow._id}/once`,
        method: 'PATCH',
      }),
      parse: (response: unknown) => {
        const workflow = response as WorkflowState;

        return {
          ...workflow,
          metadata: {
            ...workflow.metadata,
            folder: workflow.metadata.folder || 'unknown',
          },
        } as WorkflowState;
      },
    });
  }

  archiveWorkflow(
    options: Partial<HttpMutationOptions<WorkflowState, WorkflowState>> = {}
  ) {
    return httpMutation({
      request: (workflow: WorkflowState) => {
        workflow.auditing.archived = true;
        workflow.auditing.active = false;
        return {
          url: `${environment.uri}/workflows/${workflow._id}`,
          method: 'PUT',
          body: workflow,
        };
      },
      parse: (response: unknown) => {
        const workflow = response as WorkflowState;
        return {
          ...workflow,
          metadata: {
            ...workflow.metadata,
            folder: workflow.metadata.folder || 'unknown',
          },
        } as WorkflowState;
      },
    });
  }

  moveWorkflow() {
    return httpMutation({
      request: (workflow: WorkflowState) => ({
        url: `${environment.uri}/workflows/${workflow._id}`,
        method: 'PUT',
        body: workflow,
      }),
      parse: (response: unknown) => {
        const workflow = response as WorkflowState;

        return {
          ...workflow,
          metadata: {
            ...workflow.metadata,
            folder: workflow.metadata.folder || 'unknown',
          },
        } as WorkflowState;
      },
    });
  }

  restoreWorkflow(
    options: Partial<HttpMutationOptions<WorkflowState, WorkflowState>> = {}
  ) {
    return httpMutation({
      request: (workflow: WorkflowState) => {
        workflow.auditing.archived = false;
        workflow.auditing.active = false;
        return {
          url: `${environment.uri}/workflows/${workflow._id}`,
          method: 'PUT',
          body: workflow,
        };
      },
      parse: (response: unknown) => {
        const workflow = response as WorkflowState;
        return {
          ...workflow,
          metadata: {
            ...workflow.metadata,
            folder: workflow.metadata.folder || 'unknown',
          },
        } as WorkflowState;
      },
    });
  }

  // async resumeWorkflow(workflow: WorkflowState) {
  //   workflow.auditing.archived = false
  //   workflow.auditing.active = false
  //
  //   return this.updateWorkflow(signal(workflow))
  // }
  //
  // async archiveWorkflow(workflow: WorkflowState) {
  //   workflow.auditing.archived = true
  //   workflow.auditing.active = false
  //
  //   return this.updateWorkflow(signal(workflow))
  // }
}
