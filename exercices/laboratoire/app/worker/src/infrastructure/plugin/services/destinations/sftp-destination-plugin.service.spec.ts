import { SftpDestinationPluginService } from './sftp-destination-plugin.service';

describe('SftpDestinationPluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new SftpDestinationPluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('sftp-destination');
    expect(def.type).toBe('destination');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new SftpDestinationPluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
});
