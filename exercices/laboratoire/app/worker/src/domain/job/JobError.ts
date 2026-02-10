export class JobError extends Error {
  constructor(
    public job_id: any,
    public stepId: any,
    message: string,
  ) {
    super(message);
  }
}
