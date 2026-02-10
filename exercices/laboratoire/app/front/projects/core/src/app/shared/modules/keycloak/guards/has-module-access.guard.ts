import { CanActivateFn } from '@angular/router';
import {KeycloakStore} from '@shared/modules/keycloak/keycloak-store';
import {inject} from '@angular/core';

export const hasModuleAccessGuard = (module: string): CanActivateFn => (route, state) => {
  const $keycloakStore = inject(KeycloakStore)

  return $keycloakStore.hasModuleAccess(module);
};
