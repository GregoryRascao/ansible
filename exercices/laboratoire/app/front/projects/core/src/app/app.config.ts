import {
  ApplicationConfig,
  inject,
  mergeApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection
} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideTheme} from '@themes/theme.provider';
import {MemocoTheme} from '@themes/memoco.theme';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideKeycloakAngular} from '@shared/modules/keycloak/keycloak.provider';
import {environment} from '@core/src/environments/environment';
import {provideTranslateService, TranslateCompiler, TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {provideMenuPosition} from '@shared/modules/menu/providers/menu-position.provider';
import {loadMapIcons} from '@shared/modules/map/map.provider';

import translationFR from '@i18n/fr.json'
import translationNL from '@i18n/nl.json'
import translationEN from '@i18n/en.json'
import {PrimeNG} from 'primeng/config';
import {fr} from 'primelocale/js/fr.js';
import {TranslateMessageFormatCompiler} from 'ngx-translate-messageformat-compiler';
import {includeBearerTokenInterceptor} from 'keycloak-angular';
import {errorInterceptor} from '@shared/interceptors/error-interceptor';
import {provideBetterStack} from '@shared/modules/better-stack/better-stack.provider';

export const localConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        includeBearerTokenInterceptor,
        errorInterceptor(
          {code: /^5\d+/ig, message: 'error.server'},
          {code: /0/ig, message: 'error.server.preflight'},
        )])),
    provideMenuPosition('left', true),
    provideTranslateService({
      defaultLanguage: 'en',
      useDefaultLang: true,
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler,
      }
    }),
    provideKeycloakAngular({
      config: {
        url: environment.keycloak.uri,
        realm: environment.keycloak.realm,
        clientId: 'angular'
      },
      redirectUri: environment.keycloak.redirectUri,
      sessionTimeout: 1000 * 60 * 60 * 24 * 30,
    }),
    provideBetterStack({
      ...environment.betterStack,
      source: 'Waves - Front'
    }),
    // provideMarkdown(),
    provideEnvironmentInitializer(async () => {
      const $title = inject(Title)
      const $translate = inject(TranslateService)
      const $primeng = inject(PrimeNG)

      $title.setTitle('Waves')
      await loadMapIcons()

      $translate.setTranslation('fr', translationFR)
      $translate.setTranslation('en', translationEN)
      $translate.setTranslation('nl', translationNL)

      $translate.use('en')
      $primeng.setTranslation(fr)
    }),
  ]
};

export const appConfig = mergeApplicationConfig(localConfig, provideTheme(MemocoTheme))
