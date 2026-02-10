import { Test, TestingModule } from '@nestjs/testing';
import { PluginController } from './plugin.controller';

describe('PluginController', () => {
  let controller: PluginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PluginController],
    }).compile();

    controller = module.get(PluginController);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });
});
