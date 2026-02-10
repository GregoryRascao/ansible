import { inject } from "@angular/core";
import { ResolveFn } from '@angular/router';
import {WorkflowStore} from '@core/src/app/features/workflows/workflow-store';
import {RouterStore} from '@core/src/app/router-store';

export const workflowResolver: ResolveFn<boolean> = (route, state) => {
  const $workflow = inject(WorkflowStore)

  if (route.params['name']) {
    // $workflow.selectName.set(route.params['name']);
    return true
  }
  return false;
};
