import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomFormsModule  } from 'ngx-custom-validators';
import { WaitListPageRoutingModule } from "./wait-list-page-routing.module";
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from "ng-apexcharts";
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { WaitListPageComponent } from "./wait-list/wait-list-page.component";
import { ValidatedConditionsPageComponent } from "./validated-conditions/validated-conditions-page.component";
import { AboutUsPageComponent } from "./about-us/about-us-page.component";
import { BehindPageComponent } from "./behind/behind-page.component";
import { HowItWorksPageComponent } from "./how-it-works/how-it-works-page.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import { SharedModule } from "app/shared/shared.module";
import { MyFilterPipe2 } from 'app/shared/services/my-filter2.pipe';



@NgModule({
    exports: [
        TranslateModule,
        MatDatepickerModule,
        MatNativeDateModule 
    ],
    imports: [
        CommonModule,
        WaitListPageRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        CustomFormsModule,
        NgbModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatSelectModule,
        MatRadioModule,
        NgApexchartsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        SharedModule
    ],
    declarations: [
        WaitListPageComponent,
        ValidatedConditionsPageComponent,
        AboutUsPageComponent,
        BehindPageComponent,
        HowItWorksPageComponent,
        MyFilterPipe2
    ]
})
export class WaitListPageModule { }
