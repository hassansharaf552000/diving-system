import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

interface Particle {
  size: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
}

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  currentYear = new Date().getFullYear();

  /** Particles for the background animation */
  particles: Particle[] = Array.from({ length: 18 }, () => ({
    size: this.rand(6, 22),
    left: this.rand(2, 98),
    duration: this.rand(8, 18),
    delay: this.rand(0, 10),
    opacity: this.rand(3, 7) / 10
  }));

  constructor(private router: Router) {}

  navigateToOperation(): void {
    this.router.navigate(['/operation']);
  }

  navigateToAccounting(): void {
    this.router.navigate(['/accounting']);
  }

  private rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}