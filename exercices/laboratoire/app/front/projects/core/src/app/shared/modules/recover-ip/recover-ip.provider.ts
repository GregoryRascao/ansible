import {RecoverIpService} from '@shared/modules/recover-ip/recover-ip.service';
import {inject, provideEnvironmentInitializer} from '@angular/core';
import {RecoverIpStore} from '@shared/modules/recover-ip/recover-ip-store';

export const provideRecoverIp = () => [
  RecoverIpService,
  provideEnvironmentInitializer(() => {
    const $recoverIpStore = inject(RecoverIpStore)

    $recoverIpStore.loadIp()
      .then(() => console.log(`Session ip loaded: ${$recoverIpStore.ip()}`))
  })
];
