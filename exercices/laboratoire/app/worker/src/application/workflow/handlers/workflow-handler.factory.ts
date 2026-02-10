import { IBrokerPort, IPluginPort } from '../../ports/ports';
import { IWorkflowStepHandler } from './workflow-step.handler';
import { SourceStepHandler } from './source-step.handler';
import { TransformStepHandler } from './transform-step.handler';
import { DestinationStepHandler } from './destination-step.handler';

export class WorkflowHandlerFactory {
  constructor(
    private readonly broker: IBrokerPort,
    private readonly pluginProvider: IPluginPort,
  ) {}

  public createStandardChain(): IWorkflowStepHandler {
    const sourceHandler = new SourceStepHandler(
      this.broker,
      this.pluginProvider,
    );
    const transformHandler = new TransformStepHandler(
      this.broker,
      this.pluginProvider,
    );
    const destinationHandler = new DestinationStepHandler(
      this.broker,
      this.pluginProvider,
    );

    sourceHandler.setNext(transformHandler).setNext(destinationHandler);

    return sourceHandler;
  }
}
