import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContactPageComponent } from 'app/pages/wait-list/contact/contact-page.component';
import { TranslateService } from '@ngx-translate/core';

declare let gtag: any;

@Component({
    selector: 'app-behind-page',
  changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ContactPageComponent],
    templateUrl: './behind-page.component.html',
    styleUrls: ['./behind-page.component.scss'],
})

export class BehindPageComponent {
    constructor(public translate: TranslateService) {}
}
