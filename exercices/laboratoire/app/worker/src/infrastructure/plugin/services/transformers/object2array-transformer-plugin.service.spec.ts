import { Object2arrayTransformerPluginService } from './object2array-transformer-plugin.service';

describe('Object2arrayTransformerPluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new Object2arrayTransformerPluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('object2array-transformer');
    expect(def.type).toBe('transform');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new Object2arrayTransformerPluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(typeof svc.name).toBe('string');
  });
});
