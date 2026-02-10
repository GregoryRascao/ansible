import {inject, Injectable} from '@angular/core';
import {httpMutation, HttpMutationOptions} from '@angular-architects/ngrx-toolkit';
import {BetterStackModuleOptionToken} from '@shared/modules/better-stack/better-stack.provider';

export type BetterStackLog = {
  severity: 'error' | 'warn' | 'info' | 'debug',
  message: string
}

@Injectable({
  providedIn: 'root'
})
export class BetterStackService {
  private opts = inject(BetterStackModuleOptionToken)

  logMutation(options: Partial<HttpMutationOptions<BetterStackLog, any>> = {}) {
    return httpMutation({
      ...options,
      request: (log: BetterStackLog) => ({
        url: this.opts.endpoint,
        method: 'POST',
        headers: {
          ContentType: 'application/json',
          Authorization: `Bearer ${this.opts.token}`
        },
        body: {
          timestamp: new Date().toISOString(),
          severity: log.severity,
          message: log.message,
          source: this.opts.source,
        }
      })
    })
  }
}
