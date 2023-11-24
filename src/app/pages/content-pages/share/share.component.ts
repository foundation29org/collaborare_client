import { Component, OnInit, OnDestroy } from '@angular/core';
import { animate, keyframes, style, transition, trigger, state } from '@angular/animations';
import * as kf from 'app/user/home/keyframes';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-share',
    templateUrl: './share.component.html',
    styleUrls: ['./share.component.scss'],
    animations: [
      trigger('fadeSlideInOut', [
        transition(':enter', [
          animate('500ms', style({ opacity: 1, transform: 'rotateY(180deg)' })),
        ]),
        transition(':leave', [
          animate('500ms', style({ opacity: 0, transform: 'rotateY(180deg)'})),
        ]),
      ]),
      trigger('cardAnimation', [
        //transition('* => wobble', animate(1000, keyframes (kf.wobble))),
        transition('* => swing', animate(1000, keyframes(kf.swing))),
        //transition('* => jello', animate(1000, keyframes (kf.jello))),
        //transition('* => zoomOutRight', animate(1000, keyframes (kf.zoomOutRight))),
        transition('* => slideOutLeft', animate(1000, keyframes(kf.slideOutRight))),
        transition('* => slideOutRight', animate(1000, keyframes(kf.slideOutLeft))),
        //transition('* => rotateOutUpRight', animate(1000, keyframes (kf.rotateOutUpRight))),
        transition('* => fadeIn', animate(1000, keyframes(kf.fadeIn))),
      ]),
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ]
})

export class SharePageComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();
  loadedItems: Boolean = false;
  haveInfo: Boolean = false;

  constructor(public translate: TranslateService, private router: Router, public toastr: ToastrService) {
  }

  async ngOnInit() {
    this.initEnvironment();

  }

  async ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  initEnvironment(){
    var param = this.router.parseUrl(this.router.url).queryParams;
    if (param.key && param.token) {
      //getdisease items
    } else {
    }
    Swal.fire('init', '', "success");
  }

  
}
