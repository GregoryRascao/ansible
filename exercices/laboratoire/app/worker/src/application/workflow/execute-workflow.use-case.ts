import { Logger } from '@nestjs/common';
import { Workflow } from '../../domain/workflow/workflow.schema';
import { IBrokerPort, IPluginPort } from '../ports/ports';
import { WorkflowContext } from './handlers/workflow-step.handler';
import { WorkflowHandlerFactory } from './handlers/workflow-handler.factory';
import { IWorkflowObserver } from './workflow-observer.interface';

export class ExecuteWorkflowUseCase {
  private readonly handlerFactory: WorkflowHandlerFactory;
  private readonly observers: IWorkflowObserver[] = [];

  constructor(
    private readonly broker: IBrokerPort,
    private readonly pluginProvider: IPluginPort,
  ) {
    this.handlerFactory = new WorkflowHandlerFactory(broker, pluginProvider);
  }

  public addObserver(observer: IWorkflowObserver): void {
    this.observers.push(observer);
  }

  public async execute(workflow: Workflow): Promise<void> {
    const logger = new Logger(ExecuteWorkflowUseCase.name);
    logger.log(`Executing job ${workflow.job_id}`);

    const context: WorkflowContext = {
      workflow,
      extractedData: [],
      transformedData: [],
      destinationResults: [],
      workingData: [],
      observers: this.observers,
    };

    await this.notifyObservers(context, 'EXECUTING');

    const chain = this.handlerFactory.createStandardChain();

    await chain.handle(context);

    await this.notifyObservers(context, 'SUCCESS', {
      extracted: context.extractedData.map((d) => ({
        step_id: d.step_id,
        plugin: d.plugin,
        nbItems: d.values?.length || 1,
      })),
      transformed: context.transformedData.map((d) => ({
        step_id: d.step_id,
        plugin: d.plugin,
        nbItems: d.values?.length || 1,
      })),
      destination: context.destinationResults.map((d) => ({
        step_id: d.step_id,
        plugin: d.plugin,
        nbItems: d.values?.length || 1,
      })),
    });
  }

  private async notifyObservers(
    context: WorkflowContext,
    status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED',
    data?: any,
  ) {
    const update = {
      job_id: context.workflow.job_id,
      workflow_name: context.workflow.name,
      stepId: null,
      pluginName: null,
      status,
      data,
    };

    await Promise.all(
      this.observers.map((observer) => observer.update(update)),
    );
  }
}
