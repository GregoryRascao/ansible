import { JsonGroupTransformerPluginService } from './json-group-transformer-plugin.service';

describe('JsonGroupTransformerPluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new JsonGroupTransformerPluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('json-group-transformer');
    expect(def.type).toBe('transform');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new JsonGroupTransformerPluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
});
