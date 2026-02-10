import {patchState, signalStore, withComputed, withHooks, withMethods, withState} from '@ngrx/signals';
import Keycloak, {KeycloakTokenParsed} from 'keycloak-js';
import {computed, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {environment} from '@core/src/environments/environment';

export type KeycloakState = {
  token: any;
  tokenParsed: KeycloakTokenParsed | null;
}
const initialState: KeycloakState = {
  token: null,
  tokenParsed: null
}
export const KeycloakStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withComputed((store, $keycloak = inject(Keycloak)) => ({
    selectTokenParsed: computed(() => {
      return store.tokenParsed()
    }),
    selectApps: computed(() => {
      const token = store.tokenParsed()

      if (!token) return []
      return token['groups'][0].attributes.modules[0].split(',')
    })
  })),
  withHooks((store, $keycloak = inject(Keycloak)) => ({
    async onInit() {
      const isAuthenticated = $keycloak.authenticated
      if (isAuthenticated) {
        patchState(store, (state) => ({...state, token: $keycloak.token, tokenParsed: $keycloak.tokenParsed}))
      }
    },
  })),
  withMethods((store, $http = inject(HttpClient), $keycloak = inject(Keycloak)) => ({
    async getUser() {
      return $keycloak.loadUserProfile()
    },
    async isAdmin() {
      return $keycloak.hasRealmRole("admin") || $keycloak.hasResourceRole("admin")
    },
    async getUsers() {
      // Check if the user has admin privileges
      const isAdmin = this.hasRole('admin')
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin privileges required to access users')
      }

      const keycloakConfig = environment.keycloak
      const {uri, realm} = keycloakConfig

      // Ensure token is up-to-date
      await $keycloak.updateToken(30)

      // Explicitly include the authentication token in the request headers
      const headers = {
        'Authorization': `Bearer ${$keycloak.token}`,
        'Content-Type': 'application/json'
      }

      try {
        return lastValueFrom($http.get<any[]>(`${uri}/admin/realms/${realm}/users`, {headers}))
      } catch (error) {
        console.error('Error fetching users:', error)
        throw error
      }
    },
    async register() {
      await $keycloak.register()
    },
    async signOut() {
      await $keycloak.logout()
    },
    hasRole(role: string) {
      return $keycloak.hasRealmRole(role) || $keycloak.hasResourceRole(role)
    },
    async getGroups() {
      const userInfo = await this.getUserInfo()
      return userInfo.groups as any[]
    },
    async getGroup(group: string) {
      const userInfo = await this.getUserInfo()

      return userInfo.groups.find((g: any) => g.name === group) as any
    },
    async getGroupAttribute(attribute: string): Promise<any[] | undefined> {
      const keyCloakGroup = await this.getGroups()
      if (!keyCloakGroup) return undefined
      return keyCloakGroup
        .filter((g: any) => g.attributes?.[attribute])
        .flatMap((g: any) => g.attributes?.[attribute])
    },
    async getUserInfo() {
      let userInfo = $keycloak.userInfo as any
      if (!userInfo) userInfo = await $keycloak.loadUserInfo()
      return userInfo as any
    },

    async hasModuleAccess(module: string) {
      const attributes = await this.getGroupAttribute('modules')

      if (!attributes) return false
      return !!attributes.find((it: string) => it.includes(module));
    }
  }))
)
