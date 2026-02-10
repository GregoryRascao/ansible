import { MysqlSourcePluginService } from './mysql-source-plugin.service';

describe('MysqlSourcePluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new MysqlSourcePluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('mysql-source');
    expect(def.type).toBe('source');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new MysqlSourcePluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
});
