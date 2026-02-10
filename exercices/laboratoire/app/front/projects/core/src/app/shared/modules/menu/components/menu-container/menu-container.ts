import {Component, contentChild, inject, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {MENU_POSITION, MENU_TOGGLEABLE} from '../../providers/menu-position.provider';

@Component({
  selector: 'menu-container',
  imports: [
    NgTemplateOutlet,
  ],
  templateUrl: './menu-container.html',
  styleUrl: './menu-container.css'
})
export class MenuContainer {
  startTemplateRef = contentChild<TemplateRef<any>>('start')
  centerTemplateRef = contentChild<TemplateRef<any>>('center')
  endTemplateRef = contentChild<TemplateRef<any>>('end')

  position = inject(MENU_POSITION)
  menuToggleable = inject(MENU_TOGGLEABLE)
}
