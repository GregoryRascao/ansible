import {Routes} from '@angular/router';
import {authKeycloakGuard} from '@shared/modules/keycloak/guards/auth-keycloak.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authKeycloakGuard],
    children: [
      {
        path: 'workflows',
        children: [
          {path: '', loadComponent: () => import('./pages/workflows/workflows').then(c => c.Workflows)},
          {
            path: 'archive',
            loadComponent: () => import('./pages/workflow-archive/workflow-archive').then(c => c.WorkflowArchive)
          },
          {path: ':name', loadComponent: () => import('./pages/workflow-edit/workflow-edit').then(c => c.WorkflowEdit)},
        ]
      },
      {
        path: 'job',
        loadComponent: () => import('./pages/job/job').then(c => c.Job),
      },
      {
        path: 'documentation',
        children: [
          {
            path: 'user-manual',
            loadComponent: () => import('./pages/user-manual/user-manual').then(c => c.UserManual)
          }
        ]
      },
      {path: '**', redirectTo: 'workflows', pathMatch: 'full'},
    ]
  }
];
