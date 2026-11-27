import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContactPageComponent } from 'app/pages/wait-list/contact/contact-page.component';

@Component({
    selector: 'app-how-it-works-page',
  changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ContactPageComponent],
    templateUrl: './how-it-works-page.component.html',
    styleUrls: ['./how-it-works-page.component.scss'],
})

export class HowItWorksPageComponent{
    constructor( ) {
    }
}
