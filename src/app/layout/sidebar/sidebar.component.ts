import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  constructor(private router: Router) { }

  get menuItems() {
    const currentUrl = this.router.url;
    
    if (currentUrl.startsWith('/accounting')) {
      return [
        { label: 'Dashboard', icon: '🏠', route: '/accounting/dashboard' },
        { label: 'Entries', icon: '📋', route: '/accounting/entries' },
        { label: 'Codes', icon: '🏷️', route: '/accounting/codes' },
        { label: 'Reports', icon: '📊', route: '/accounting/reports' },
        { label: 'Help', icon: '❓', route: '/accounting/help' }
      ];
    }
    
    // Default to operation menu items
    return [
      { label: 'Dashboard', icon: '🏠', route: '/operation/dashboard' },
      { label: 'Entries', icon: '📋', route: '/operation/entries' },
      { label: 'Codes', icon: '🏷️', route: '/operation/codes' },
      { label: 'Reports', icon: '📊', route: '/operation/reports' },
      { label: 'Help', icon: '❓', route: '/operation/help' }
    ];
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
