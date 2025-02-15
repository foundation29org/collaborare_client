import { Component, Output, EventEmitter, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../services/layout.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { TrackEventsService } from 'app/shared/services/track-events.service';
import { InsightsService } from 'app/shared/services/azureInsights.service';
import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import { AuthService } from 'app/shared/auth/auth.service';

@Component({
  selector: 'app-navbar-dx29',
  templateUrl: './navbar-dx29.component.html',
  styleUrls: ['./navbar-dx29.component.scss']
})

@Injectable()
export class NavbarD29Component implements OnInit, AfterViewInit, OnDestroy {
  toggleClass = 'ft-maximize';
  placement = "bottom-right";
  hideSidebar: boolean = true;
  public isCollapsed = true;
  layoutSub: Subscription;
  @Output()
  toggleHideSidebar = new EventEmitter<Object>();

  public config: any = {};
  isHomePage: boolean = false;
  isClinicianPage: boolean = false;
  isPatientPage: boolean = false;
  isUndiagnosedPatientPage: boolean = false;
  isEdHubPage: boolean = false;
  isAboutPage: boolean = false;
  isBehingPage: boolean = false;
  isDonaPage: boolean = false;
  isValidatedConditionsPage: boolean = false;
  isHowIsWorksPage: boolean = false;
  role: string = 'Clinical';
  subrole: string = 'null';
  _startTime: any;
  menuPosition = 'Side';
  isSmallScreen = false;
  isMenuExpanded = false;
  protected innerWidth: any;
  private subscription: Subscription = new Subscription();
  isLoggedIn: boolean = false;
  actualUrl: string = '';

  constructor(public translate: TranslateService, private layoutService: LayoutService, private configService: ConfigService, private router: Router, public trackEventsService: TrackEventsService, public insightsService: InsightsService, private authService: AuthService) {

    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.actualUrl = event.url;
      var tempUrl = (event.url).toString();
        if (tempUrl.indexOf('/.') != -1 || tempUrl == '/') {
          this.isHomePage = true;
          this.isAboutPage = false;
          this.isBehingPage = false;
          this.isValidatedConditionsPage = false;
          this.isHowIsWorksPage = false;
          this.role = 'Clinical';
          this.subrole = 'null';
        } else if (tempUrl.indexOf('/aboutus') != -1) {
          this.isHomePage = false;
          this.isAboutPage = true;
          this.isBehingPage = false;
          this.isValidatedConditionsPage = false;
          this.isHowIsWorksPage = false;
        } else if (tempUrl.indexOf('/behind') != -1) {
          this.isHomePage = false;
          this.isAboutPage = false;
          this.isBehingPage = true;
          this.isHowIsWorksPage = false;
        } else if (tempUrl.indexOf('/conditions') != -1) {
          this.isHomePage = false;
          this.isAboutPage = false;
          this.isBehingPage = false;
          this.isValidatedConditionsPage = true;
          this.isHowIsWorksPage = false;
        } else if (tempUrl.indexOf('/how-it-works') != -1) {
          this.isHomePage = false;
          this.isAboutPage = false;
          this.isBehingPage = false;
          this.isValidatedConditionsPage = false;
          this.isHowIsWorksPage = true;
        }else {
          this.isHomePage = false;
          this.isAboutPage = false;
          this.isBehingPage = false;
          this.isValidatedConditionsPage = false;
          this.isHowIsWorksPage = false;
        }
        this.isLoggedIn = this.authService.isLoggedIn();
    });
    this.innerWidth = window.innerWidth;
    this.layoutSub = layoutService.toggleSidebar$.subscribe(
      isShow => {
        this.hideSidebar = !isShow;
      });

    this._startTime = Date.now();
  }

  getUserInitials(): string {
    const email = this.authService.getEmail();
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '';
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.isLoggedIn = false;
      this.router.navigate(['/']);
    });
  }

  ngOnInit() {
    this.config = this.configService.templateConf;
    if (this.innerWidth < 1200) {
      this.isSmallScreen = true;
    }
    else {
      this.isSmallScreen = false;
    }
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  ngAfterViewInit() {
    if (this.config.layout.dir) {
      setTimeout(() => {
        const dir = this.config.layout.dir;
        if (dir === "rtl") {
          this.placement = "bottom-left";
        } else if (dir === "ltr") {
          this.placement = "bottom-right";
        }
      }, 0);

    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.layoutSub) {
      this.layoutSub.unsubscribe();
    }
  }

  ToggleClass() {
    if (this.toggleClass === "ft-maximize") {
      this.toggleClass = "ft-minimize";
    } else {
      this.toggleClass = "ft-maximize";
    }
  }

  toggleNotificationSidebar() {
    this.layoutService.toggleNotificationSidebar(true);
  }

  toggleSidebar() {
    const appSidebar = document.getElementsByClassName("app-sidebar")[0];
    if (appSidebar.classList.contains("hide-sidebar")) {
      this.toggleHideSidebar.emit(false);
    } else {
      this.toggleHideSidebar.emit(true);
    }
  }

  goToLogin(){
    this.router.navigate(['/login']);
  }
  goHome(){
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
  }
  closeMenu() {
    this.isMenuExpanded = false;
  }

}
