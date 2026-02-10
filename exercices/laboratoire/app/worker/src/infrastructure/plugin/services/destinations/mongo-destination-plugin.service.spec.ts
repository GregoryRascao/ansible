import { MongoDestinationPluginService } from './mongo-destination-plugin.service';

describe('MongoDestinationPluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new MongoDestinationPluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('mongo-destination-plugin');
    expect(def.type).toBe('destination');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new MongoDestinationPluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
});
