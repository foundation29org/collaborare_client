import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WaitListPageComponent } from "./wait-list/wait-list-page.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '.',
        component: WaitListPageComponent,
        data: {
          title: 'Collaborare'
        },
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaitListPageRoutingModule { }
