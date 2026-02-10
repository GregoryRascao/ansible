import { Group2csvTransformerPluginService } from './group2csv-transformer-plugin.service';

describe('Group2csvTransformerPluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new Group2csvTransformerPluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('group2csv-transformer');
    expect(def.type).toBe('transform');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new Group2csvTransformerPluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
});
