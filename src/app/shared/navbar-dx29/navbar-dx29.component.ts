import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { NgbDropdown, NgbDropdownToggle, NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TrackEventsService } from 'app/shared/services/track-events.service';
import { AuthService } from 'app/shared/auth/auth.service';

@Component({
  selector: 'app-navbar-dx29',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass, RouterLink, NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, TranslatePipe],
  templateUrl: './navbar-dx29.component.html',
  styleUrls: ['./navbar-dx29.component.scss']
})
export class NavbarD29Component implements OnInit, OnDestroy {
  isHomePage: boolean = false;
  isAboutPage: boolean = false;
  isBehingPage: boolean = false;
  isValidatedConditionsPage: boolean = false;
  isHowIsWorksPage: boolean = false;
  isMenuExpanded = false;
  isLoggedIn: boolean = false;
  actualUrl: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private router: Router, public trackEventsService: TrackEventsService, private authService: AuthService) {
    this.subscription.add(
      this.router.events.pipe(
        filter((event: any) => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        this.actualUrl = event.url;
        const tempUrl = event.url.toString();
        this.isHomePage = tempUrl.indexOf('/.') != -1 || tempUrl == '/';
        this.isAboutPage = !this.isHomePage && tempUrl.indexOf('/aboutus') != -1;
        this.isBehingPage = !this.isHomePage && !this.isAboutPage && tempUrl.indexOf('/behind') != -1;
        this.isValidatedConditionsPage = !this.isHomePage && !this.isAboutPage && !this.isBehingPage && tempUrl.indexOf('/conditions') != -1;
        this.isHowIsWorksPage = !this.isHomePage && !this.isAboutPage && !this.isBehingPage && !this.isValidatedConditionsPage && tempUrl.indexOf('/how-it-works') != -1;
        this.isLoggedIn = this.authService.isLoggedIn();
      })
    );
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
  }

  closeMenu() {
    this.isMenuExpanded = false;
  }
}
