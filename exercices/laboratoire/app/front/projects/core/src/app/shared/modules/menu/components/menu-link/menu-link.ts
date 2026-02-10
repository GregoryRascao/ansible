import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MenuItemOptions } from '@shared/modules/menu/models/menu';
import { MENU_ORIENTATION } from '@shared/modules/menu/providers/menu-position.provider';
import { Button } from 'primeng/button';

@Component({
  selector: 'menu-link',
  imports: [RouterLink, RouterLinkActive, NgClass, NgTemplateOutlet],
  templateUrl: './menu-link.html',
  styleUrl: './menu-link.css',
})
export class MenuLink {
  orientation = inject(MENU_ORIENTATION);
  menuItem = input.required<MenuItemOptions>();

  id = computed(() => this.menuItem().id);
  label = computed(() => this.menuItem().label);
  iconDef = computed(() => {
    const menuItem = this.menuItem();
    const { icon, iconPosition } = menuItem;

    if (!icon) return undefined;
    if (!iconPosition) return { name: icon, position: 'left' };
    return { name: icon, position: iconPosition };
  });
  routerLink = computed(() => this.menuItem().routerLink);

  isVertical = computed(() => this.orientation() === 'vertical');
  isHorizontal = computed(() => this.orientation() === 'horizontal');

  executeCommand(command: Function) {
    if (command) {
      command();
    }
  }
}
