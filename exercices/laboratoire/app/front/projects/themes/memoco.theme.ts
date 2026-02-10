import Aura from "@primeuix/themes/aura";
import {definePreset, palette} from '@primeuix/themes';
import {CoreMenuTheme} from '@shared/modules/menu/styles/menu.theme';
import {MIndicatorTheme} from '@shared/ui/m-indicator/m-indicator.theme';

export const indicatorTheme: MIndicatorTheme = {
  pulse: {duration: '2s'},
};

const coreMenuStyle: CoreMenuTheme = {
  menu: {
    link: {
      group: {
        color: '{primary-500}',
        size: '2rem',
      },
      hover: '{primary-300}'
    },
    start: {
      align: 'start',
      gap: '3'
    },
    end: {
      align: 'end'
    },
    vertical: {
      width: '15%'
    },
    container: {
      backgroundColor: '{primary-100}',
      margin: '0rem'
    }
  }
}

const primary = palette("#70bca8")
export const MemocoTheme = definePreset(Aura, {
  semantic: {
    primary
  },
  extend: {
    core: {
      ...coreMenuStyle
    },
    indicator: {...indicatorTheme}
  },
  components: {

  }
});

