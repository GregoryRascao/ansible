import {Component, inject, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';

import {Drawer} from 'primeng/drawer';
import {MenuItemOptions} from '../../core/src/app/components/core-menu/core-menu';
import Keycloak from 'keycloak-js';

@Component({
  imports: [
    RouterOutlet,
    Drawer,
  ],
  templateUrl: './design-test.component.html',
  styleUrl: './design-test.component.css',
  standalone: true
})
export class DesignTestComponent {
  private $router = inject(Router);
  private $keycloak = inject(Keycloak);

  orientation = signal<'vertical' | 'horizontal'>('vertical');

  items = signal<MenuItemOptions[]>([
    {label: 'Indicator', icon: 'pi pi-wrench', routerLink: ['./indicator']},
    {label: 'Proportion', icon: 'pi pi-inbox', routerLink: ['./proportion']},
    {label: 'Map', icon: 'pi pi-map', routerLink: ['./map']},
  ]);

  drawerVisible = false;

  onSignOut() {
    // this.$auth.signOut().then(() => this.$router.navigate(['/sign-in']));
  }
}
