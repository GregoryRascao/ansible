import { Plugin } from '../../infrastructure/plugin/plugin-form';
import { z } from 'zod';

export interface BasePlugin<T> {
  initialize(init: T): void;

  getPluginDefinition(): Omit<Plugin, 'id'>;
  getSchema(): z.ZodSchema;
  get name(): string;
}
