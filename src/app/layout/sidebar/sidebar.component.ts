import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems = [
    { label: 'Dashboard', icon: '🏠', route: '/dashboard' },
    { label: 'Entries', icon: '📋', route: '/entries' },
    { label: 'Codes', icon: '🏷️', route: '/codes' },
    { label: 'Reports', icon: '📊', route: '/reports' },
    { label: 'Help', icon: '❓', route: '/help' }
  ];

  constructor(private router: Router) { }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
