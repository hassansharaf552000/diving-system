import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private readonly router = inject(Router);
  
  userName = 'Ibram';
  userInitials = 'IW';
  notificationCount = 3;

  navigateToLanding(): void {
    this.router.navigate(['']);
  }
}
