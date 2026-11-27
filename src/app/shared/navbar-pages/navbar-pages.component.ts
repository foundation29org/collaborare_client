import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TrackEventsService } from 'app/shared/services/track-events.service';

@Component({
  selector: 'app-navbar-pages',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './navbar-pages.component.html',
  styleUrls: ['./navbar-pages.component.scss']
})
export class NavbarPagesComponent implements OnDestroy {
  isHomePage: boolean = false;
  isLoginPage: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private router: Router, public trackEventsService: TrackEventsService) {
    this.updateFlags(this.router.url);
    this.subscription.add(
      this.router.events.pipe(
        filter((event: any) => event instanceof NavigationEnd)
      ).subscribe((event: any) => this.updateFlags(event.url.toString()))
    );
  }

  private updateFlags(url: string) {
    this.isHomePage = url.indexOf('/.') != -1 || url == '/';
    this.isLoginPage = !this.isHomePage && url.indexOf('/login') != -1;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
