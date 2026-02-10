export interface WorkflowUpdate {
  job_id: string;
  workflow_name: string | null;
  stepId: string | null;
  pluginName: string | null;
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
  data?: any;
}

export interface IWorkflowObserver {
  update(event: WorkflowUpdate): Promise<void>;
}
