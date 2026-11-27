import { Routes } from '@angular/router';

import { WaitListPageLayoutComponent } from './layouts/wait-list/wait-list-page-layout.component';
import { ContentLayoutComponent } from './layouts/content/content-layout.component';
import { authGuard } from './shared/auth/auth-guard.service';
import { roleGuard } from './shared/auth/role-guard.service';

export const routes: Routes = [
  { path: '', redirectTo: '.', pathMatch: 'full' },

  // Public pages with the navbar
  {
    path: '',
    component: WaitListPageLayoutComponent,
    data: { title: 'Wait List Page' },
    children: [
      {
        path: '.',
        loadComponent: () => import('./pages/wait-list/wait-list/wait-list-page.component').then(m => m.WaitListPageComponent),
        data: { title: 'CollaboRARE' }
      },
      {
        path: 'conditions',
        loadComponent: () => import('./pages/wait-list/validated-conditions/validated-conditions-page.component').then(m => m.ValidatedConditionsPageComponent),
        data: { title: 'Validated conditions' }
      },
      {
        path: 'aboutus',
        loadComponent: () => import('./pages/wait-list/about-us/about-us-page.component').then(m => m.AboutUsPageComponent),
        data: { title: 'About CollaboRARE' }
      },
      {
        path: 'behind',
        loadComponent: () => import('./pages/wait-list/behind/behind-page.component').then(m => m.BehindPageComponent),
        data: { title: 'Behind collaborare' }
      },
      {
        path: 'how-it-works',
        loadComponent: () => import('./pages/wait-list/how-it-works/how-it-works-page.component').then(m => m.HowItWorksPageComponent),
        data: { title: 'How it works' }
      }
    ]
  },

  // Login, privacy policy, error and share pages (no sidebar, no footer)
  {
    path: '',
    component: ContentLayoutComponent,
    data: { title: 'content Views' },
    children: [
      {
        path: 'error',
        loadComponent: () => import('./pages/content-pages/error/error-page.component').then(m => m.ErrorPageComponent),
        data: { title: 'Error Page' }
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/content-pages/login/login-page.component').then(m => m.LoginPageComponent),
        data: { title: 'menu.Login' }
      },
      {
        path: 'privacy-policy',
        loadComponent: () => import('./pages/content-pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyPageComponent),
        data: { title: 'registration.Privacy Policy' }
      },
      {
        path: 'share',
        loadComponent: () => import('./pages/content-pages/share/share.component').then(m => m.SharePageComponent),
        data: { title: 'open.Public sharing' }
      }
    ]
  },

  // Signed-in area
  {
    path: '',
    component: WaitListPageLayoutComponent,
    data: { title: 'full Views' },
    canActivate: [authGuard],
    children: [
      {
        path: 'mycondition',
        loadComponent: () => import('./user/home/home.component').then(m => m.HomeComponent),
        data: { title: 'menu.Dashboard', expectedRole: ['User'] },
        canActivate: [authGuard, roleGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./user/profile/profile.component').then(m => m.ProfileComponent),
        data: { title: 'menu.Profile', expectedRole: ['User'] },
        canActivate: [authGuard, roleGuard]
      }
    ]
  },

  { path: '**', redirectTo: '.' }
];
