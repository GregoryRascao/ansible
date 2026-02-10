import { Csv2jsonTransformerPluginService } from './csv2json-transformer-plugin.service';

describe('Csv2jsonTransformerPluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new Csv2jsonTransformerPluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('csv2json-transformer');
    expect(def.type).toBe('transform');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new Csv2jsonTransformerPluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
});
