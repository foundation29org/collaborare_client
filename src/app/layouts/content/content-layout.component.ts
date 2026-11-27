import { Component, Inject, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavbarPagesComponent } from 'app/shared/navbar-pages/navbar-pages.component';

// Layout for login, privacy policy, error and share pages (no sidebar, no footer).
@Component({
  selector: 'app-content-layout',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, NavbarPagesComponent],
  templateUrl: './content-layout.component.html',
  styleUrls: ['./content-layout.component.scss']
})
export class ContentLayoutComponent implements OnInit, OnDestroy {
  isPrivacyPage: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(@Inject(DOCUMENT) private document: Document, private router: Router) {
    this.isPrivacyPage = this.router.url.indexOf('/privacy-policy') != -1;
    this.subscription.add(
      this.router.events.pipe(
        filter((event: any) => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        this.isPrivacyPage = event.url.toString().indexOf('privacy-policy') != -1;
      })
    );
  }

  ngOnInit() {
    const body = this.document.body;
    body.classList.remove('layout-dark', 'menu-expanded', 'navbar-static', 'menu-open');
    body.classList.add('vertical-layout', 'menu-hide', 'navbar-sticky', 'auth-page', 'blank-page');
  }

  ngOnDestroy() {
    this.document.body.classList.remove('auth-page');
    this.subscription.unsubscribe();
  }
}
