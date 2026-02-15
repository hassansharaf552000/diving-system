import { Component } from '@angular/core';

@Component({
  selector: 'app-entries',
  standalone: false,
  templateUrl: './entries.component.html',
  styleUrl: './entries.component.scss'
})
export class EntriesComponent {
  searchTerm = '';

  entries = [
    { label: 'Entry Excursion', icon: '🎯' },
    { label: 'Entry Traffic', icon: '🚗' },
    { label: 'Entry Revenue', icon: '💰' },
    { label: 'Entry Guide Allowance', icon: '👤' },
    { label: 'Entry Rep Commission', icon: '📝' },
    { label: 'Invoice Agent', icon: '📄' },
    { label: 'Invoice Supplier Boat', icon: '🚢' },
    { label: 'Invoice Supplier Excursion', icon: '🏖️' },
    { label: 'Invoice Supplier Transportation', icon: '🚌' }
  ];

  get filteredEntries() {
    if (!this.searchTerm) return this.entries;
    const term = this.searchTerm.toLowerCase();
    return this.entries.filter(e => e.label.toLowerCase().includes(term));
  }

  openEntry(entry: any): void {
    alert(`Opening ${entry.label}...\n\nThis feature will be available soon!`);
  }
}
