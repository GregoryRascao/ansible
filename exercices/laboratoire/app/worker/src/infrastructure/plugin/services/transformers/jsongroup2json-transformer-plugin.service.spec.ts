import { JsonGroup2jsonTransformerPluginService } from './jsongroup2json-transformer-plugin.service';

describe('JsonGroup2jsonTransformerPluginService', () => {
  it('should expose a valid plugin definition', () => {
    // Service needs a dependency but for definition/schema/name it is not used
    // so we can pass undefined as any safely in this unit context
    const svc = new JsonGroup2jsonTransformerPluginService(undefined as any);
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('jsongroup2json-transformer');
    expect(def.type).toBe('transform');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new JsonGroup2jsonTransformerPluginService(undefined as any);
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
});
