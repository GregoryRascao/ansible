import {ApplicationConfig} from '@angular/core';
import {providePrimeNG} from 'primeng/config';
import {ThemeService} from './theme.service';
import {MessageService} from 'primeng/api';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

export const provideTheme = function (theme: any, isDark: boolean = false): ApplicationConfig {
  return {
    providers: [
      provideAnimationsAsync(),
      providePrimeNG({
        theme: {
          preset: theme,
          options: {
            darkModeSelector: ".dark",
            cssLayer: {
              name: 'primeng',
              order: 'theme, base, primeng'
            }
          }
        }
      }),
      {
        provide: ThemeService,
        useFactory: () => new ThemeService(isDark),
        multi: false
      },
      MessageService
    ]
  };
};
