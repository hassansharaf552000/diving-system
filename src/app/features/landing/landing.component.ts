import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  navigateToOperation(): void {
    this.router.navigate(['/operation']);
  }

  navigateToAccounting(): void {
    this.router.navigate(['/accounting']);
  }
}