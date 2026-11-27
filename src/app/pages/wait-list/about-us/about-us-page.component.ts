import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContactPageComponent } from 'app/pages/wait-list/contact/contact-page.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-about-us-page',
  changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ContactPageComponent],
    templateUrl: './about-us-page.component.html',
    styleUrls: ['./about-us-page.component.scss'],
})

export class AboutUsPageComponent {
    constructor( public translate: TranslateService) {}
}
