// import { parentPort, workerData } from 'worker_threads';
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../../app.module';
// import { Workflow } from './workflow.schema';
// import { WorkflowService } from './workflow.service';
// import { ZodError } from 'zod/index';
// import { StepError } from '../plugin/errors/StepError';
// import { JobError } from '../job/errors/JobError';
// import { Logger } from '@nestjs/common';
//
// async function main() {
//   try {
//     const workflow = workerData as Workflow;
//
//     const appContext = await NestFactory.createApplicationContext(AppModule, {
//       logger: false,
//     });
//
//     const workflowService = appContext.get(WorkflowService);
//
//     const sendStepError = async function (error: StepError) {
//       Logger.error(error.message, WorkflowService.name);
//       await this.$broker.publish('error', '', {
//         message: 'Job Error',
//         error: {
//           jobId: error.jobId,
//           stepId: error.stepId,
//         },
//       });
//     };
//     const sendJobError = async function (error: JobError) {
//       Logger.error(error.message, WorkflowService.name);
//       await this.$broker.publish('error', '', {
//         message: 'Job Error',
//         error: {
//           jobId: error.jobId,
//           stepId: error.stepId,
//           message: error.message,
//         },
//       });
//     };
//     const sendZodError = async function (error: ZodError) {
//       Logger.error(error.message, WorkflowService.name);
//       await this.$broker.publish('error', '', {
//         message: 'Invalid workflow',
//         error: error.message,
//       });
//     };
//     const sendInternalError = async function (error: Error) {
//       Logger.error(error.message, WorkflowService.name);
//       await this.$broker.publish('error', '', {
//         message: 'Internal error',
//         error: error.message,
//       });
//     };
//     const sendJobUpdate = async function (
//       jobId: string,
//       stepId: string | null,
//       pluginName: string | null,
//       status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED',
//       data?: any,
//     ) {
//       const msg = { jobId, stepId, pluginName, status } as Record<string, any>;
//       if (data) {
//         msg.data = data;
//       }
//       await this.$broker.publish('job', 'waves.job.update', msg);
//     };
//
//     try {
//       await workflowService.executeJob(workflow);
//     } catch (error) {
//       if (error instanceof ZodError) {
//         await this.sendZodError(error);
//       } else if (error instanceof StepError) {
//         await this.sendStepError(error);
//       } else if (error instanceof JobError) {
//         await this.sendJobError(error);
//       } else if (error instanceof Error) {
//         await this.sendInternalError(error);
//       } else {
//         await this.sendInternalError(error as Error);
//       }
//     }
//   } catch (err) {
//     parentPort?.postMessage({
//       ok: false,
//       error: { message: err?.message ?? String(err), stack: err?.stack },
//     });
//   }
// }
//
// main().catch((err) => {
//   parentPort?.postMessage({
//     ok: false,
//     error: { message: err?.message ?? String(err), stack: err?.stack },
//   });
// });
