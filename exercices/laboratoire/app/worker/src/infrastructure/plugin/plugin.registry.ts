import { Injectable, Type } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { BasePlugin } from '../../domain/plugin/base-plugin';
import { Plugin } from './plugin-form';

@Injectable()
export class PluginRegistry {
  private plugins: Map<string, Type<any>> = new Map();
  private initialized = false;
  private pluginDefinitionsCache: Array<Omit<Plugin, 'id'>> = [];

  constructor(
    private readonly $moduleRef: ModuleRef,
    private readonly $discovery: DiscoveryService,
  ) {
    // Defer heavy discovery until first explicit call
  }

  private toKebabCase(input: string): string {
    return input
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .toLowerCase();
  }

  private derivePluginNameFromClass(ctor: Function): string | null {
    const name = ctor.name || '';
    // Expected pattern: <Something>PluginService
    const suffix = 'PluginService';
    if (!name.endsWith(suffix)) {
      return null;
    }
    const base = name.substring(0, name.length - suffix.length); // remove suffix
    return this.toKebabCase(base);
  }

  async autoRegisterPlugins() {
    if (this.initialized) {
      return this.pluginDefinitionsCache;
    }

    const pluginDefinitions: Array<Omit<Plugin, 'id'>> = [];

    // Discover providers but restrict scope to PluginModule to avoid scanning entire app
    const providers = this.$discovery
      .getProviders()
      .filter(
        (wrapper) =>
          !!wrapper && typeof (wrapper as any).metatype === 'function',
      )
      .filter((wrapper: any) =>
        // only classes that look like plugin services
        (wrapper.metatype?.name || '').endsWith('PluginService'),
      )
      .filter((wrapper: any) => (wrapper.host?.name || '') === 'PluginModule');

    for (const wrapper of providers as any[]) {
      const metatype = wrapper.metatype as Type<any>;
      const derived = this.derivePluginNameFromClass(metatype);
      if (!derived) continue;

      // Create a lightweight instance on demand to fetch the definition
      const pluginInstance = (await this.$moduleRef.create(
        metatype,
      )) as unknown as BasePlugin<any>;
      try {
        pluginDefinitions.push(pluginInstance.getPluginDefinition());
        this.plugins.set(derived, metatype);
      } catch (e) {
        // ignore faulty plugin definitions to prevent startup failure
        // optionally log later via caller
      }
    }

    this.pluginDefinitionsCache = pluginDefinitions;
    this.initialized = true;
    return pluginDefinitions;
  }

  register(name: string, plugin: Type<any>) {
    const key = this.toKebabCase(name);
    this.plugins.set(key, plugin);
  }

  getPluginByName(name: string) {
    const key = this.toKebabCase(name);
    let plugin = this.plugins.get(key);

    if (!plugin) {
      // In case someone passed the exact class name
      plugin = this.plugins.get(name);
    }

    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    return this.$moduleRef.create(plugin);
  }
}
