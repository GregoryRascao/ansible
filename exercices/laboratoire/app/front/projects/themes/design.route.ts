import {Routes} from '@angular/router';

export const designRoute: Routes = [
  {
    path: 'design-test',
    loadComponent: () => import('./design-test/design-test.component').then(c => c.DesignTestComponent),
    children: [
      {
        path: 'indicator',
        loadComponent: () => import('./test/test-indicator/test-indicator.component').then(c => c.TestIndicatorComponent)
      },
      {
        path: 'proportion',
        loadComponent: () => import('./test/test-proportion-bar/test-proportion-bar.component').then(c => c.TestProportionBarComponent)
      },
      {
        path: 'map',
        loadComponent: () => import('./test/test-map/test-map.component').then(c => c.TestMapComponent)
      }
    ]
  }
]
