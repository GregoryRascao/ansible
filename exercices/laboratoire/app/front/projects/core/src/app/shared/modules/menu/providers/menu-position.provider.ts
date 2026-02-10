import {computed, InjectionToken, provideEnvironmentInitializer, signal, WritableSignal} from '@angular/core';
import {breakpoints} from '@shared/utils/resize/breakpoints';

export type MenuPosition = 'left' | 'top' | 'right' | 'bottom';
export type MenuOrientation = 'horizontal' | 'vertical';

export const MENU_POSITION = new InjectionToken<WritableSignal<MenuPosition>>('core.menu.position');
export const MENU_ORIENTATION = new InjectionToken<WritableSignal<MenuOrientation>>('core.menu.orientation');
export const MENU_TOGGLEABLE = new InjectionToken<WritableSignal<boolean>>('core.menu.toggleable');

export const toToggleSignal = signal(false)
const resizeObserver = new ResizeObserver(() => {
  window.addEventListener('resize', (event) => {
    const is2Xl = window.innerWidth >= breakpoints["2xl"]
    const isXl = !is2Xl && window.innerWidth >= breakpoints["xl"]
    const isLg = !is2Xl && !isXl && window.innerWidth >= breakpoints["lg"]
    const isMd = !is2Xl && !isXl && !isLg && window.innerWidth >= breakpoints["md"]
    const isSm = !is2Xl && !isXl && !isLg && !isMd && window.innerWidth >= breakpoints["sm"]

    if (isMd || isSm) {
      // this.menuToggleable.set(true)
      toToggleSignal.set(true)
    }
    else {
      // this.menuToggleable.set(false)
      toToggleSignal.set(false)
    }
  })
})
resizeObserver.observe(document.body)

export const provideMenuPosition = (position: MenuPosition, toggleable: boolean = false) => {
  const positionSignal = signal(position);
  const orientationSignal = computed(
    () => (['left', 'right'].includes(position) ? 'vertical' : 'horizontal')
  );
  const toggleableSignal = signal(toggleable);

  return [
    {provide: MENU_TOGGLEABLE, useValue: toggleableSignal, multi: false},
    {provide: MENU_POSITION, useValue: positionSignal, multi: false},
    {provide: MENU_ORIENTATION, useValue: orientationSignal, multi: false},
  ];
}
