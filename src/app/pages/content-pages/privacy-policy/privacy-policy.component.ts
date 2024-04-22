import { Component, Optional  } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from "@angular/router";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-privacy-policy',
    templateUrl: './privacy-policy.component.html',
    styleUrls: ['./privacy-policy.component.scss']
})

export class PrivacyPolicyPageComponent {
  constructor(public translate: TranslateService, private router: Router, @Optional() public activeModal: NgbActiveModal) {
  }

  goTo(url){
    document.getElementById(url).scrollIntoView(true);
  }

  back(){
    //window.history.back();
    this.router.navigate(['/']);
  }

  close(){
    if (this.activeModal) {
      this.activeModal.close('Close click');
    } else {
      this.back();  // O alguna otra lógica de navegación si no se está en un modal
    }
  }
}
