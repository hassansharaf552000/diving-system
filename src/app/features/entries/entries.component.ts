import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface EntryCard {
  key: string;
  label: string;
  route: string;
  icon: string;
  desc: string;
  gradient: string;
}

@Component({
  selector: 'app-entries',
  standalone: false,
  templateUrl: './entries.component.html',
  styleUrl: './entries.component.scss'
})
export class EntriesComponent {
  searchTerm = '';

  entries: EntryCard[] = [
    { key: 'transaction',      label: 'Transaction',       route: '/entries/transaction',      icon: '💳', desc: 'Manage financial transactions',        gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { key: 'traffic',          label: 'Traffic',            route: '/entries/traffic',          icon: '🚗', desc: 'Track traffic & movement data',        gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
    { key: 'revenue',          label: 'Revenue',            route: '/entries/revenue',          icon: '💰', desc: 'Revenue records & reporting',           gradient: 'linear-gradient(135deg, #f6d365, #fda085)' },
    { key: 'guide-allowance',  label: 'Guide Allowance',    route: '/entries/guide-allowance',  icon: '👤', desc: 'Guide allowance & compensation',       gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
    { key: 'rep-commission',   label: 'Rep Commission',     route: '/entries/rep-commission',   icon: '📝', desc: 'Representative commission entries',     gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    { key: 'boat-coast',       label: 'Boat Coast',         route: '/entries/boat-coast',       icon: '🚢', desc: 'Boat coast & maritime expenses',        gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  ];

  constructor(private router: Router) {}

  get filteredEntries(): EntryCard[] {
    if (!this.searchTerm) return this.entries;
    const term = this.searchTerm.toLowerCase();
    return this.entries.filter(e =>
      e.label.toLowerCase().includes(term) || e.desc.toLowerCase().includes(term)
    );
  }

  openEntry(entry: EntryCard): void {
    this.router.navigate([entry.route]);
  }
}
