import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  
  userName = '';
  userInitials = '';

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.userName = user.fullName || user.userName;
      this.userInitials = this.userName.substring(0, 2).toUpperCase();
    }
  }

  navigateToLanding(): void {
    this.router.navigate(['']);
  }

  logout(): void {
    this.authService.logout();
  }
}
