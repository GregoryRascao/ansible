import { CanActivateFn } from '@angular/router';
import Keycloak from 'keycloak-js';
import {inject} from '@angular/core';

export const authKeycloakGuard: CanActivateFn = (route, state) => {
  const $keycloak = inject(Keycloak)

  if (!!$keycloak.authenticated) {
    return true;
  }
  return $keycloak.login()
    .then(() => true)
    .catch(() => false);
};
