import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/interfaces/auth.interfaces';

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit {
  currentYear = new Date().getFullYear();
  currentUser: UserProfile | null = null;
  canManageUsers = false;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser();
    this.canManageUsers = this.auth.hasRole('SuperAdmin', 'Admin');
  }

  navigateToOperation(): void {
    this.router.navigate(['/operation']);
  }

  navigateToAccounting(): void {
    this.router.navigate(['/accounting']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  logout(): void {
    this.auth.logout();
  }
}