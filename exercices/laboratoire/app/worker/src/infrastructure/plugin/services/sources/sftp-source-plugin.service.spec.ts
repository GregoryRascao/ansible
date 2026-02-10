import { SftpSourcePluginService } from './sftp-source-plugin.service';

describe('SftpSourcePluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new SftpSourcePluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('sftp-source');
    expect(def.type).toBe('source');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new SftpSourcePluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
});
