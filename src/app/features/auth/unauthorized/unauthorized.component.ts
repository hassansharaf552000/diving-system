import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: false,
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss'],
})
export class UnauthorizedComponent {
  constructor(private router: Router, private auth: AuthService) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.auth.logout();
  }
}
