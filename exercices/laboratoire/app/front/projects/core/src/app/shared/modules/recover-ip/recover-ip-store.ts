import {patchState, signalStore, withMethods, withProps, withState} from '@ngrx/signals';
import {inject} from '@angular/core';
import {RecoverIpService} from '@shared/modules/recover-ip/recover-ip.service';

export type RecoverIpState = {
  ip: string
}

export const initialState: RecoverIpState = {
  ip: '127.0.0.1'
}

export const RecoverIpStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setIp(ip: string) {patchState(store, (state) => ({...state, ip})) },
    async loadIp() {
      const $ip = inject(RecoverIpService)
      const ip = await $ip.getCurrentIp()
      patchState(store, (state) => ({...state, ip}))
    }
  }))
)
