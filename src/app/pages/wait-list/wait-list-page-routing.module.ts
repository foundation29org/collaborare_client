import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WaitListPageComponent } from "./wait-list/wait-list-page.component";
import { ValidatedConditionsPageComponent } from "./validated-conditions/validated-conditions-page.component";
import { AboutUsPageComponent } from "./about-us/about-us-page.component";
import { BehindPageComponent } from "./behind/behind-page.component";
import { HowItWorksPageComponent } from "./how-it-works/how-it-works-page.component";
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '.',
        component: WaitListPageComponent,
        data: {
          title: 'CollaboRARE'
        },
      },
      {
        path: 'conditions',
        component: ValidatedConditionsPageComponent,
        data: {
          title: 'Validated conditions'
        },
      },
      {
        path: 'aboutus',
        component: AboutUsPageComponent,
        data: {
          title: 'About collaborare'
        }
      },
      {
        path: 'behind',
        component: BehindPageComponent,
        data: {
          title: 'Behind collaborare'
        }
      },
      {
        path: 'how-it-works',
        component: HowItWorksPageComponent,
        data: {
          title: 'How it works'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaitListPageRoutingModule { }
