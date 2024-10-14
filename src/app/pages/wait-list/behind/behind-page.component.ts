import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

declare let gtag: any;

@Component({
    selector: 'app-behind-page',
    templateUrl: './behind-page.component.html',
    styleUrls: ['./behind-page.component.scss'],
})

export class BehindPageComponent {
    constructor(public translate: TranslateService) {}
}
