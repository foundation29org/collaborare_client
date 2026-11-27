import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarD29Component } from 'app/shared/navbar-dx29/navbar-dx29.component';

// Layout with the top navbar. The theme styles depend on a few classes of <body>
// (the old Apex layout service set them at runtime); they are set here directly.
@Component({
  selector: 'app-wait-list-page-layout',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, NavbarD29Component],
  templateUrl: './wait-list-page-layout.component.html',
  styleUrls: ['./wait-list-page-layout.component.scss']
})
export class WaitListPageLayoutComponent implements OnInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    const body = this.document.body;
    body.classList.remove('blank-page', 'auth-page', 'layout-dark');
    body.classList.add('vertical-layout', 'menu-hide', 'navbar-sticky');
  }
}
