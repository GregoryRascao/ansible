import {
  AutoRefreshTokenService,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  provideKeycloak,
  UserActivityService,
  withAutoRefreshToken,
} from 'keycloak-angular';
import {environment} from '@core/src/environments/environment';

export interface KeycloakConfigOptions {
  url: string
  realm: string
  clientId: string
}

export interface KeycloakOptions {
  config: KeycloakConfigOptions,
  redirectUri: string,
  sessionTimeout: number
}

const keycloakInterceptorCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  bearerPrefix: "bearer",
  // urlPattern: /^(http:\/\/192.168.145.200:8080)(\/.*)?$/i
  urlPattern: new RegExp(`^(${environment.keycloak.uri})(\/.*)?$`, 'i')
})
const backEndInterceptorCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  bearerPrefix: "bearer",
  urlPattern: new RegExp(`^(${environment.uri})(\/.*)?$`, 'i')
})

export const provideKeycloakAngular = (options: KeycloakOptions) => provideKeycloak({
  config: options.config,
  initOptions: {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/keycloak/silent-check-sso.html',
    checkLoginIframe: false,
    redirectUri: options.redirectUri,
  },
  features: [
    withAutoRefreshToken({
      onInactivityTimeout: 'logout',
      sessionTimeout: options.sessionTimeout,
    }),
  ],
  providers: [
    AutoRefreshTokenService,
    UserActivityService,
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [keycloakInterceptorCondition, backEndInterceptorCondition],
    },
  ]
})
