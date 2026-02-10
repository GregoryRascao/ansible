import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {inject} from '@angular/core';
import {AuthGuardData, createAuthGuard} from 'keycloak-angular';
import Keycloak from 'keycloak-js';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
  authData: AuthGuardData,
  role: string,
): Promise<boolean | UrlTree> => {
  const $keycloak = inject(Keycloak)

  if ($keycloak.authenticated && ($keycloak.hasRealmRole(role) || $keycloak.hasResourceRole(role))) {
    return true;
  }
  return false;
};

export const isAllowedGuard = (role: string) => createAuthGuard((r,_, authData) => isAccessAllowed(r, _, authData, role))
