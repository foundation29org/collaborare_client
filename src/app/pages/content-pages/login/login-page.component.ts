import { Component, ViewChild, OnDestroy, OnInit  } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from "@angular/router";
import { AuthService } from '../../../../app/shared/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent implements OnDestroy, OnInit{

    @ViewChild('f') loginForm: NgForm;
    //loginForm: FormGroup;
    sending: boolean = false;

    isBlockedAccount: boolean = false;
    isLoginFailed: boolean = false;
    errorAccountActivated: boolean = false;
    emailResent: boolean = false;
    supportContacted: boolean = false;
    isAccountActivated: boolean = false;
    isActivationPending: boolean = false;
    isBlocked: boolean = false;
    email: string;
    userEmail: string;
    private subscription: Subscription = new Subscription();
    private subscription2: Subscription = new Subscription();
    private subscriptionIntervals: Subscription = new Subscription();
    startTime: Date = null;
    finishTime: Date = null;
    isApp: boolean = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 && location.hostname != "localhost" && location.hostname != "127.0.0.1";

    user: any;
  haveToken: boolean = false;
  isLoading: boolean = false;
  showTryAgain: boolean = false;

    constructor(private router: Router, public authService: AuthService, public translate: TranslateService, public toastr: ToastrService) {
      if(this.authService.getEnvironment()){
        let url =  this.authService.getRedirectUrl();
        this.router.navigate([ url ]);
      }
     }

     ngOnInit() {
       const urlParams = new URLSearchParams(window.location.search);
        const email = decodeURIComponent(urlParams.get('email') || '');
        const key = decodeURIComponent(urlParams.get('key') || '');
        if(email && key){
          let form = {email: email, confirmationCode: key};
        this.subscription.add( this.authService.checkLogin(form).subscribe(
          (authenticated:any) => {
            if(authenticated) {
              this.haveToken = true;
              let url =  this.authService.getRedirectUrl();
              this.router.navigate([ url ]);
              this.sending = false;
            }else{
              this.haveToken = false;
              this.sending = false;
              let message =  this.authService.getMessage();
                if(message == "Login failed" || message == "Not found"){
                    this.isLoginFailed = true;
                  }else{
                  this.toastr.error('', message);
                }
            }
          }));
        }
        
      }

      callToLogin(idToken){
        var info = {idToken:idToken};
        this.subscription2 = this.authService.checkLogin(info).subscribe(
          authenticated => {
          //this.loginForm.reset();
          if(authenticated) {
            this.haveToken = true;
              let url =  this.authService.getRedirectUrl();
              this.router.navigate([ url ]);
              this.sending = false;

          }else {
            this.haveToken = false;
            this.sending = false;
            let message =  this.authService.getMessage();
              if(message == "Login failed" || message == "Not found"){
                  this.isLoginFailed = true;
                }else{
                this.toastr.error('', message);
              }
          }
          }
      );
      }
      

     ngOnDestroy() {
       if(this.subscription) {
            this.subscription.unsubscribe();
        }
       if(this.subscriptionIntervals) {
            this.subscriptionIntervals.unsubscribe();
        }
         if(this.subscription2) {
          this.subscription2.unsubscribe();
        }
     }

     submitInvalidForm() {
       if (!this.loginForm) { return; }
       const base = this.loginForm;
       for (const field in base.form.controls) {
         if (!base.form.controls[field].valid) {
             base.form.controls[field].markAsTouched()
         }
       }
     }

    // On registration link click
    onRegister() {
        this.router.navigate(['/register']);
    }

    sendSignInLink(email: string, event?: Event) {
      this.isLoginFailed = false;
      if(event) {
        event.preventDefault();  // Evita el envío real del formulario
      }
      let form = {email: email};
    this.subscription.add( this.authService.login(form).subscribe(
      (authenticated:any) => {
        if(authenticated) {
          Swal.fire({
            title: this.translate.instant("login.almost done"),
            html: '<p class="mt-2">'+this.translate.instant("login.login link")+'</p><ol><li class="mb-2">'+this.translate.instant("login.p1")+'</li> <li class="mb-2">'+this.translate.instant("login.p2")+'</li> <li class="mb-2">'+this.translate.instant("login.p3")+'</li> </ol>',
            icon: 'success',
            showCancelButton: false,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Ok'
          }).then((result) => {
          })
          this.isLoginFailed = false;
        }else{
          this.isLoginFailed = true;
        }
        
      }));
    }

}
