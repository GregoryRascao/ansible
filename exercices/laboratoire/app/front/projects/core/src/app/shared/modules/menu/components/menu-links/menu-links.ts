import {Component, computed, inject, input} from '@angular/core';
import {MENU_ORIENTATION} from '../../providers/menu-position.provider';
import {MenuItem} from 'primeng/api';
import {MenuLink} from '../menu-link/menu-link';
import {MUiComponent, mUiToken} from '@shared/ui/m-ui-component/m-ui.component';
import {CoreMenuStylePart} from '@shared/modules/menu/styles/menu.theme';

@Component({
  selector: 'menu-links',
  imports: [
    MenuLink
  ],
  templateUrl: './menu-links.html',
  styleUrl: './menu-links.css',
  providers: [
    { provide: mUiToken, useValue: '--core-menu-links', multi: true}
  ]
})
export class MenuLinks extends MUiComponent<CoreMenuStylePart>{
  orientation = inject(MENU_ORIENTATION)

  justifyContent = input<'start' | 'center' | 'end'>('start')
  alignContent = input<'start' | 'center' | 'end'>('start')
  gap = input<string>('10px')

  menuItems = input.required<MenuItem[]>()

  isHorizontal = computed(() => this.orientation() === 'horizontal')
  isVertical = computed(() => this.orientation() === 'vertical')
}
