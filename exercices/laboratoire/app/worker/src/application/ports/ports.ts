export interface IBrokerPort {
  publish(exchange: string, routingKey: string, content: any): Promise<void>;
  onReconnect(callback: () => void): void;
  setupInfrastructure(
    exchange: string,
    type: string,
    queue: string,
    queueType: 'quorum' | 'direct',
    keys: string[],
  ): Promise<void>;
  consume(
    queue: string,
    onMessage: (msg: any) => Promise<void>,
    keys: string[],
  ): Promise<void>;
}

export interface IPluginPort {
  executeSource(workflowName: string, jobId: string, source: any): Promise<any>;
  executeTransform(
    workflowName: string,
    jobId: string,
    transform: any,
    data: any[],
  ): Promise<any>;
  executeDestination(
    workflowName: string,
    jobId: string,
    destination: any,
    data: any[],
  ): Promise<any>;
}
