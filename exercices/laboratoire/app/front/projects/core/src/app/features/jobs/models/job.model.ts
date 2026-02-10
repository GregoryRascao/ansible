import {ExecutionStatus} from '@features/workflows/workflow-store';

export type ExecutionMessage = {
  error: Error;
  message: string;
  humanReadable?: string;
};

export type JobHistoryModel = {
  _id: any;
  job_id: any;
  worker_id: any;
  workflowName: string;
  createdAt: Date;
  status: ExecutionStatus;
  acknowledged: boolean;
};

export type JobStepHistoryModel = {
  _id: any;
  job_id: any;
  worker_id: any;
  pluginName: any;
  executionDate: Date;
  executionStatus: ExecutionStatus;
  executionResult: any;
  executionError: ExecutionMessage;
};
