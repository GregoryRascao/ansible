import { Json2jsonTransformerPluginService } from './json2json-transformer-plugin.service';

describe('Json2jsonTransformerPluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new Json2jsonTransformerPluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('json2json-transformer');
    expect(def.type).toBe('transform');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new Json2jsonTransformerPluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
  it('should handle ISO 8601 strings when sourceDateFormat does not match', async () => {
    const svc = new Json2jsonTransformerPluginService();
    const config = {
      mappingRules: [
        {
          destField: 'DATE',
          mappingRule: '$.value.timestamp',
          sourceType: 'date',
          sourceDateFormat: 'dd/MM/yyyy HH:mm',
        },
      ],
      dateFormat: 'dd/MM/yyyy HH:mm',
    };
    svc.initialize(config);

    const data = [
      {
        DATA: { index: 0 },
        value: {
          timestamp: '2026-01-26T20:55:07Z',
        },
      },
    ];

    const result = await svc.transform(
      'test-workflow',
      'job-1',
      'step-1',
      data,
    );
    expect(result[0].DATE).toMatch(/26\/01\/2026 (20:55|21:55)/);
  });
});
