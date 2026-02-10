import { ElasticSearchSourcePluginService } from './elastic-search-source-plugin.service';

describe('ElasticSearchSourcePluginService', () => {
  it('should expose a valid plugin definition', () => {
    const svc = new ElasticSearchSourcePluginService();
    const def = svc.getPluginDefinition();
    expect(def).toBeDefined();
    expect(def.name).toBe('elastic-search-source');
    expect(def.type).toBe('source');
    expect(def.formDefinition).toBeDefined();
  });

  it('should have a matching name', () => {
    const svc = new ElasticSearchSourcePluginService();
    expect(svc.name).toBe(svc.getPluginDefinition().name);
  });
});
