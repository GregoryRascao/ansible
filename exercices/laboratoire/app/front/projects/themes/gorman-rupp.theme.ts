import Aura from '@primeuix/themes/aura';
import {definePreset} from '@primeuix/themes';

import {MIndicatorTheme} from '@shared/ui/m-indicator/m-indicator.theme';

export const indicatorTheme: MIndicatorTheme = {
  pulse: {duration: '2s'},
};
// export const mapTheme: MMapTheme = {
//   height: '93vh',
// }

export const GormanRuppTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: 'rgb(242,247,251)',
      100: 'rgb(194,219,236)',
      200: 'rgb(145,190,221)',
      300: 'rgb(97,161,207)',
      400: 'rgb(48,132,192)',
      500: 'rgb(0,103,177)',
      600: 'rgb(0,88,150)',
      700: 'rgb(0,72,124)',
      800: 'rgb(0,57,97)',
      900: 'rgb(0,41,71)',
      950: 'rgb(0,26,44)',
    },
  },
  extend: {
    indicator: {...indicatorTheme},
    // map: {...mapTheme},
  },
  components: {
    menu: {
      root: {
        background: '{surface-0}',
        color: '{primary-500}'
      },
      item: {
        color: '{primary-300}',
      },
      extend: {
        submenu: {
          label: {
            color: '{primary-500}',
          }
        }
      }

    },
    menubar: {
      root: {
        background: '{surface-0}',
      },
    },
    card: {
      root: {
        background: '{surface-0}',
        shadow: 'none',
        borderRadius: '6px',
      },
      extend: {
        border: '1px solid {gray-200}',
      }
    },
    drawer: {
      root: {},
    },
  },
});
