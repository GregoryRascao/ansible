import { JsonUnwindTransformerPluginService } from './json-unwind-transformer-plugin.service';

describe('JsonUnwindTransformerPluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new JsonUnwindTransformerPluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('json-unwind-transformer');
    expect(def.type).toBe('transform');
    expect(def.formDefinition).toBeDefined();
  });

  it('should expose a zod schema and a matching name', () => {
    const svc = new JsonUnwindTransformerPluginService();
    const schema = svc.getSchema();
    expect(schema).toBeDefined();
    expect(typeof (schema as any).safeParse).toBe('function');
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });

  describe('transform', () => {
    let service: JsonUnwindTransformerPluginService;

    beforeEach(() => {
      service = new JsonUnwindTransformerPluginService();
    });

    it('should handle empty fields array and return data items as is', async () => {
      const config = { fields: [] };
      service.initialize(config);

      const data = [
        { id: 1, items: [{ a: 1 }, { a: 2 }] },
        { id: 2, items: [{ a: 3 }] },
      ];

      const result = await service.transform(
        'test-workflow',
        'job-1',
        'step-1',
        data,
      );

      expect(result).toEqual(data);
    });

    it('should handle data as array of arrays when fields is empty', async () => {
      const config = { fields: [] };
      service.initialize(config);

      const data = [[{ id: 1 }, { id: 2 }], [{ id: 3 }]];

      const result = await service.transform(
        'test-workflow',
        'job-1',
        'step-1',
        data,
      );

      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('should unwind multiple fields', async () => {
      const config = {
        fields: [{ field: '$.dates' }, { field: '$.values' }],
      };
      service.initialize(config);

      const data = [
        {
          id: 'sn1',
          dates: ['2023-01-01', '2023-01-02'],
          values: [10, 20],
        },
      ];

      const result = await service.transform(
        'test-workflow',
        'job-1',
        'step-1',
        data,
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'sn1',
        dates: { index: 0, value: '2023-01-01' },
        values: { index: 0, value: 10 },
      });
      expect(result[1]).toEqual({
        id: 'sn1',
        dates: { index: 1, value: '2023-01-02' },
        values: { index: 1, value: 20 },
      });
    });
  });
});
