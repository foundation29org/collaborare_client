import { Router } from '@angular/router';
import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'
import * as decode from 'jwt-decode';
import { ICurrentPatient } from './ICurrentPatient.interface';
import { InsightsService } from 'app/shared/services/azureInsights.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnInit, OnDestroy {
  private token: string;
  private loginUrl: string = '/.';
  private redirectUrl: string = '/home';
  private isloggedIn: boolean = false;
  private message: string;
  private iduser: string;
  private role: string;
  private subrole: string;
  private group: string;
  private expToken: number = null;
  private currentPatient: ICurrentPatient = null;
  private patientList: Array<ICurrentPatient> = null;
  private isApp: boolean = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 && location.hostname != "localhost" && location.hostname != "127.0.0.1";
  private subscription: Subscription = new Subscription();

  constructor(private http: HttpClient, public router: Router, public insightsService: InsightsService, public translate: TranslateService) {}


  ngOnInit() {
  }

  async ngOnDestroy() {
    /*if (this.subscription) {
      this.subscription.unsubscribe();
    }*/
  }

  getEnvironment():boolean{
    if(localStorage.getItem('tokencollaborare')){
      this.setAuthenticated(localStorage.getItem('tokencollaborare'));
      const tokenPayload = decode(localStorage.getItem('tokencollaborare'));
      this.setIdUser(tokenPayload.sub);
      this.setExpToken(tokenPayload.exp);
      this.setRole(tokenPayload.role);
      this.setSubRole(tokenPayload.subrole);
      this.setRedirectUrl('/home')
      //this.setGroup(tokenPayload.group);
      return true;
    }else{
      return false;
    }
  }

  setEnvironment(token:string):void{
    this.setAuthenticated(token);
    // decode the token to get its payload
    const tokenPayload = decode(token);
    this.setIdUser(tokenPayload.sub);
    this.setExpToken(tokenPayload.exp);
    this.setRole(tokenPayload.role);
    this.setSubRole(tokenPayload.subrole);
    this.setRedirectUrl('/home')
    //this.setGroup(tokenPayload.group);
    //save localStorage
    localStorage.setItem('tokencollaborare', token)
  }

  login(formValue: any): Observable<boolean> {
    //your code for signing up the new user
    return this.http.post(environment.api+'/api/login',formValue)
    .pipe(
      tap((res: any) => {
          if(res.message == "Check email"){
          }else{
            this.isloggedIn = false;
          }
          return this.isloggedIn;
        }),
        catchError((err) => {
          console.log(err);
          this.insightsService.trackException(err);
          //this.isLoginFailed = true;
          this.setMessage("Login failed");
          this.isloggedIn = false;
          return of(this.isloggedIn); // aquí devuelves un observable que emite this.isloggedIn en caso de error
        })
      );
  }

  checkLogin(formValue: any): Observable<boolean> {
    //your code for signing up the new user
    return this.http.post(environment.api+'/api/checkLogin',formValue)
    .pipe(
      tap((res: any) => {
          if(res.message == "You have successfully logged in"){
            this.setEnvironment(res.token);
          }else if(res.message == "Link expired"){
            this.isloggedIn = false;
            Swal.fire({
              title: this.translate.instant("login.The access link has expired"),
              html: '<p class="mt-2">'+this.translate.instant("login.mesaggeexpired")+'</p>',
              icon: 'error',
              showCancelButton: false,
              confirmButtonColor: '#DD6B55',
              confirmButtonText: 'Ok'
            }).then((result) => {
            })
          }else{
            this.isloggedIn = false;
          }
          this.setMessage(res.message);
          return this.isloggedIn;
        }),
        catchError((err) => {
          console.log(err);
          this.insightsService.trackException(err);
          //this.isLoginFailed = true;
          this.setMessage("Login failed");
          this.isloggedIn = false;
          return of(this.isloggedIn); // aquí devuelves un observable que emite this.isloggedIn en caso de error
        })
      );
  }

  async logout() {
    this.router.navigate(['/.']);
      localStorage.clear();
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      this.token = null;
      this.role = null;
      this.subrole = null;
      this.group = null;
      this.expToken = null;
      this.isloggedIn = false;
      this.message = null;
      this.currentPatient = null;
      this.patientList = null;
      this.iduser = null;
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    // here you can check if user is authenticated or not through his token
    return this.isloggedIn;
  }
  //este metodo sobraría si se usa el metodo signinUser
  setAuthenticated(token) {
    // here you can check if user is authenticated or not through his token
    this.isloggedIn=true;
    this.token=token;
  }
  getLoginUrl(): string {
		return this.loginUrl;
	}
  getRedirectUrl(): string {
		return this.redirectUrl;
	}
	setRedirectUrl(url: string): void {
		this.redirectUrl = url;
	}
  setMessage(message: string): void {
		this.message = message;
	}
  getMessage(): string {
		return this.message;
	}
  setRole(role: string): void {
    this.role = role;
  }
  getRole(): string {
    return this.role;
  }
  setSubRole(subrole: string): void {
    this.subrole = subrole;
  }
  getSubRole(): string {
    return this.subrole;
  }
  setGroup(group: string): void {
    this.group = group;
  }
  getGroup(): string {
    return this.group;
  }
  setExpToken(expToken: number): void {
    this.expToken = expToken;
  }
  getExpToken(): number {
    return this.expToken;
  }
  setIdUser(iduser: string): void {
    this.iduser = iduser;
  }
  getIdUser(): string {
    return this.iduser;
  }
  setCurrentPatient(currentPatient: ICurrentPatient): void {
    this.currentPatient = currentPatient;
  }
  getCurrentPatient(): ICurrentPatient {
    return this.currentPatient;
  }
  setPatientList(patientList: Array<ICurrentPatient>): void {
    this.patientList = patientList;
  }
  getPatientList(): Array<ICurrentPatient> {
    return this.patientList;
  }
  getIsApp(): boolean {
    return this.isApp;
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
