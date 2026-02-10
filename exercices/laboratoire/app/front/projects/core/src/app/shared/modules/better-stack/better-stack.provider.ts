import {InjectionToken, Provider} from '@angular/core';
import {BetterStackService} from '@shared/modules/better-stack/services/better-stack.service';

export const BetterStackModuleOptionToken = new InjectionToken<BetterStackModuleOptions>('betterstack.options');
export type BetterStackModuleOptions = {
  source: string;
  endpoint: string;
  token: string;
}
export const provideBetterStack = (opts: BetterStackModuleOptions): Provider => {
  return [
    {provide: BetterStackModuleOptionToken, useValue: opts},
    BetterStackService
  ]
}
