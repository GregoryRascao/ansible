import { FtpDestinationPluginService } from './ftp-destination-plugin.service';

describe('FtpDestinationPluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new FtpDestinationPluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('ftp-destination');
    expect(def.type).toBe('destination');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new FtpDestinationPluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
});
