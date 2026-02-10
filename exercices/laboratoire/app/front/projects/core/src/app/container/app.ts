import {Component, effect, inject, model, signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';
import {Drawer} from 'primeng/drawer';
import {Button} from 'primeng/button';
import {Image} from 'primeng/image';
import {MenuContainer} from '@shared/modules/menu/components/menu-container/menu-container';
import {MenuLinks} from '@shared/modules/menu/components/menu-links/menu-links';
import {
  MENU_ORIENTATION,
  MENU_POSITION,
  MENU_TOGGLEABLE,
  toToggleSignal
} from '@shared/modules/menu/providers/menu-position.provider';
import {MenuItemOptions} from '@shared/modules/menu/models/menu';
import {Title} from '@angular/platform-browser';
import {Menubar} from 'primeng/menubar';
import {KeycloakStore} from '@shared/modules/keycloak/keycloak-store';
import {Toast} from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [
    MenuContainer,
    MenuLinks,
    RouterOutlet,
    NgTemplateOutlet,
    Drawer,
    Button,
    Image,
    Menubar,
    RouterLink,
    Toast
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  menuPosition = inject(MENU_POSITION)
  menuToggleable = inject(MENU_TOGGLEABLE)
  menuOrientation = inject(MENU_ORIENTATION)
  private $title = inject(Title)
  private $keycloak = inject(KeycloakStore)


  title = signal(this.$title.getTitle())
  menuVisible = model(false)
  menuItems = signal<MenuItemOptions[]>([
    {separator: true},
    {
      label: 'Workflow',
      items: [
        {label: 'List', icon: 'pi pi-fw pi-cog', iconPosition: 'left', routerLink: ['/workflows']},
        {label: 'Archive', icon: 'pi pi-fw pi-folder', iconPosition: 'left', routerLink: ['/workflows/archive']},
      ]
    },
    {
      label: 'Job',
      items: [
        {label: 'List', icon: 'pi pi-fw pi-cog', iconPosition: 'left', routerLink: ['/job']},
      ]
    },
    {
      label: 'Documentation',
      items: [
        {
          label: 'Manuel utilisateur',
          icon: 'pi pi-fw pi-book',
          iconPosition: 'left',
          routerLink: ['/documentation/user-manual']
        },
        {
          label: 'Source',
          icon: 'pi pi-fw pi-github',
          iconPosition: 'left',
          class: 'hover:cursor-pointer',
          command: () => this.redirectToDocumentation()
        }
      ]
    },
    {
      label: 'User',
      items: [
        {
          label: 'Sign out',
          icon: 'pi pi-fw pi-sign-out',
          iconPosition: 'left',
          command: () => this.signOut(),
        }
      ]
    },
  ])

  toggleEffect = effect(() => {
    const toggleSignal = toToggleSignal()

    this.menuToggleable.set(toggleSignal)
  })

  signOut() {
    this.$keycloak.signOut()
  }

  private redirectToDocumentation() {
    window.open("https://memoco.odoo.com/knowledge/article/721", "_blank")
  }
}
