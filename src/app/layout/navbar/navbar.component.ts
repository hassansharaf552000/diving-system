import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  userName = 'Ibram';
  userInitials = 'IW';
  notificationCount = 3;
}
