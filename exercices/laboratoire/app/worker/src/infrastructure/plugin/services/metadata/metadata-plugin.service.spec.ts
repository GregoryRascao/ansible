import { MetadataPluginService } from './metadata-plugin.service';

describe('MetadataPluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new MetadataPluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('metadata');
    expect(def.type).toBe('metadata');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new MetadataPluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(typeof svc.name).toBe('string');
  });
});
