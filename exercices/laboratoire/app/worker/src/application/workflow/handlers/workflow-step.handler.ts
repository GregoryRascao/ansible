import { Workflow } from '../../../domain/workflow/workflow.schema';
import { IBrokerPort, IPluginPort } from '../../ports/ports';
import { IWorkflowObserver } from '../workflow-observer.interface';

export interface WorkflowContext {
  workflow: Workflow;
  extractedData: any[];
  transformedData: any[];
  destinationResults: any[];
  workingData: any[];
  observers: IWorkflowObserver[];
}

export interface IWorkflowStepHandler {
  setNext(handler: IWorkflowStepHandler): IWorkflowStepHandler;
  handle(context: WorkflowContext): Promise<void>;
}

export abstract class AbstractWorkflowStepHandler
  implements IWorkflowStepHandler
{
  private nextHandler: IWorkflowStepHandler | null = null;

  constructor(
    protected readonly broker: IBrokerPort,
    protected readonly pluginProvider: IPluginPort,
  ) {}

  public setNext(handler: IWorkflowStepHandler): IWorkflowStepHandler {
    this.nextHandler = handler;
    return handler;
  }

  public async handle(context: WorkflowContext): Promise<void> {
    await this.process(context);

    if (this.nextHandler) {
      await this.nextHandler.handle(context);
    }
  }

  protected abstract process(context: WorkflowContext): Promise<void>;

  protected async notifyObservers(
    context: WorkflowContext,
    status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED',
    stepId: string | null = null,
    pluginName: string | null = null,
    data?: any,
  ) {
    const update = {
      job_id: context.workflow.job_id,
      workflow_name: context.workflow.name,
      stepId,
      pluginName,
      status,
      data,
    };

    await Promise.all(
      context.observers.map((observer) => observer.update(update)),
    );
  }
}
