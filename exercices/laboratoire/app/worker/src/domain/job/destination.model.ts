export type JobDestinationResponse = {
  job_id: any;
  step_id: any;
  plugin: string;
  values: any[];
};
export type JobDestination = { step_id: string; name: string; options: any };
