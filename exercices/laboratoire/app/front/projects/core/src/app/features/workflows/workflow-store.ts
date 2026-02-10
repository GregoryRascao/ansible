import {patchState, signalStore, withMethods, withProps, withState} from '@ngrx/signals';
import {inject} from '@angular/core';
import {PluginType} from '@features/plugins/models/plugin-form';
import {RouterStore} from '@core/src/app/router-store';

export type WorkflowAuditing = {
  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  updatedBy: string,
  active: boolean,
  archived: boolean,
}
export type ExecutionStatus = 'SUCCESS' | 'ERROR' | 'TIMEOUT'

export type WorkflowMetadata = {
  name: string,
  folder?: string
  order?: number,
  description: string,
  cronExpression: string,
  lastExecutionDate?: Date,
  lastExecutionStatus?: ExecutionStatus,
  nbJobInFailedStatus?: number
}
export type WorkflowStep = {
  pluginName: string,
  pluginType: PluginType,
  values: any,
}
export type WorkflowState = {
  _id?: any,
  running?: boolean,
  metadata: WorkflowMetadata,
  steps: WorkflowStep[],
  auditing: WorkflowAuditing,
}

export const WorkflowStore = signalStore(
  withState<{ workflow: WorkflowState | null }>({workflow: null}),
  withProps((store) => ({})),
  withMethods((store, route = inject(RouterStore)) => ({
    updateWorkflow(workflow: WorkflowState) {
      patchState(store, {workflow})
    },
  })),
)
