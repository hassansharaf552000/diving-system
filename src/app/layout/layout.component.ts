import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  isAccounting = false;

  constructor(private router: Router) {
    this.isAccounting = this.router.url.startsWith('/accounting');
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isAccounting = e.urlAfterRedirects?.startsWith('/accounting') || e.url?.startsWith('/accounting');
    });
  }
}
