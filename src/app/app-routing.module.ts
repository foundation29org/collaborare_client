import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

//import { FullLayoutComponent } from "./layouts/full/full-layout.component";
import { ContentLayoutComponent } from "./layouts/content/content-layout.component";
import { WaitListPageLayoutComponent } from "./layouts/wait-list/wait-list-page-layout.component";

import { Full_ROUTES } from "./shared/routes/full-layout.routes";
import { CONTENT_ROUTES } from "./shared/routes/content-layout.routes";

import { Wait_List_Pages_ROUTES } from "./shared/routes/wait-list-page-layout.routes"
import { AuthGuard } from './shared/auth/auth-guard.service';
import { CanDeactivateGuard } from './shared/auth/can-deactivate-guard.service';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '.',
    pathMatch: 'full',
  },
  { path: '', component: WaitListPageLayoutComponent, data: { title: 'Wait List Page' }, children: Wait_List_Pages_ROUTES },
  { path: '', component: ContentLayoutComponent, data: { title: 'content Views' }, children: CONTENT_ROUTES },
  { path: '', component: WaitListPageLayoutComponent, data: { title: 'full Views' }, children: Full_ROUTES, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '.'}
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [
    CanDeactivateGuard
  ]
})

export class AppRoutingModule {
}
