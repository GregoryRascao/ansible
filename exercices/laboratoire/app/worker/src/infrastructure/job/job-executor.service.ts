import { Injectable } from '@nestjs/common';
import { IPluginPort } from '../../application/ports/ports';
import { PluginRegistry } from '../plugin/plugin.registry';
import { SourcePlugin } from '../../domain/plugin/source-plugin';
import { PluginNotFoundError } from '../../domain/plugin/PluginNotFoundError';
import { TransformPlugin } from '../../domain/plugin/transform-plugin';
import { StepError } from '../../domain/plugin/StepError';
import { DestinationPlugin } from '../../domain/plugin/destination-plugin';

@Injectable()
export class JobExecutorService implements IPluginPort {
  constructor(private readonly $pluginRegistry: PluginRegistry) {}

  async executeSource(
    workflowName: string,
    jobId: any,
    source: any,
  ): Promise<any> {
    const plugin = (await this.$pluginRegistry.getPluginByName(
      source.name,
    )) as SourcePlugin<any>;

    if (!plugin) {
      throw new PluginNotFoundError(
        jobId,
        workflowName,
        source.step_id,
        source.name,
        `Plugin ${source.name} not found`,
      );
    }

    try {
      if (source.options && Object.keys(source.options).length > 0) {
        plugin.initialize(source.options);
      }
      return await plugin.extract(workflowName, jobId, source.step_id);
    } catch (error) {
      const { message } = error as Error;
      throw new StepError(
        jobId,
        workflowName,
        source.step_id,
        source.name,
        message,
      );
    }
  }

  async executeTransform(
    workflowName: string,
    jobId: string,
    transform: any,
    sourceData: any[],
  ): Promise<any> {
    const plugin = (await this.$pluginRegistry.getPluginByName(
      transform.name,
    )) as TransformPlugin<any>;

    if (!plugin) {
      throw new PluginNotFoundError(
        jobId,
        workflowName,
        transform.step_id,
        transform.name,
        `Plugin ${transform.name} not found`,
      );
    }

    try {
      if (transform.options && Object.keys(transform.options).length > 0) {
        plugin.initialize(transform.options);
      }
      return await plugin.transform(
        workflowName,
        jobId,
        transform.step_id,
        sourceData,
      );
    } catch (error) {
      const { message } = error as Error;

      throw new StepError(
        jobId,
        workflowName,
        transform.step_id,
        transform.name,
        message,
      );
    }
  }

  async executeDestination(
    workflowName: string,
    jobId: string,
    destination: any,
    sourceData: any[],
  ): Promise<any> {
    const plugin = (await this.$pluginRegistry.getPluginByName(
      destination.name,
    )) as DestinationPlugin<any>;

    if (!plugin) {
      throw new PluginNotFoundError(
        jobId,
        workflowName,
        destination.step_id,
        destination.name,
        `Plugin ${destination.name} not found`,
      );
    }

    try {
      if (destination.options && Object.keys(destination.options).length > 0) {
        plugin.initialize(destination.options);
      }
      return await plugin.publish(
        workflowName,
        jobId,
        destination.step_id,
        sourceData,
      );
    } catch (error) {
      const { message } = error as Error;

      throw new StepError(
        jobId,
        workflowName,
        destination.step_id,
        destination.name,
        `Step[${destination.step_id}]: Plugin[${destination.name}] => ${message}`,
      );
    }
  }
}
