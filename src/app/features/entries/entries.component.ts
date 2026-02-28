import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService, OperationEntry } from '../../core/services/accounting.service';

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
export class EntriesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly accountingService = inject(AccountingService);
  
  searchTerm = '';
  protected readonly entries = signal<EntryCard[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Static mapping for visual properties + routes
  private readonly entryVisuals: Record<string, { icon: string; desc: string; gradient: string; route: string }> = {
    'entryexcursions': { 
      icon: '🏝️', 
      desc: 'Manage excursion entries', 
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      route: '/operation/entries/transaction'
    },
    'entrytraffic': { 
      icon: '🚗', 
      desc: 'Track traffic & movement data', 
      gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
      route: '/operation/entries/traffic'
    },
    'entryrevenue': { 
      icon: '💰', 
      desc: 'Revenue records & reporting', 
      gradient: 'linear-gradient(135deg, #f6d365, #fda085)',
      route: '/operation/entries/revenue'
    },
    'entryguideallowance': { 
      icon: '👤', 
      desc: 'Guide allowance & compensation', 
      gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      route: '/operation/entries/guide-allowance'
    },
    'entryrepcommission': { 
      icon: '📝', 
      desc: 'Representative commission entries', 
      gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
      route: '/operation/entries/rep-commission'
    },
    'invoiceagent': { 
      icon: '👨‍💼', 
      desc: 'Agent invoice management', 
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      route: '/operation/entries/transaction'
    },
    'invoicesupplierboat': { 
      icon: '🚢', 
      desc: 'Boat supplier invoice entries', 
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      route: '/operation/entries/boat-coast'
    },
    'invoicesupplierexcursion': { 
      icon: '🏖️', 
      desc: 'Excursion supplier invoices', 
      gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
      route: '/operation/entries/transaction'
    },
    'invoicesuppliertransportation': { 
      icon: '🚌', 
      desc: 'Transportation supplier invoices', 
      gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)',
      route: '/operation/entries/transaction'
    }
  };

  ngOnInit(): void {
    this.loadOperationEntries();
  }

  private loadOperationEntries(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.accountingService.getOperationEntries().subscribe({
      next: (operationEntries) => {
        const mappedEntries = this.mapApiDataToEntryCards(operationEntries);
        this.entries.set(mappedEntries);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading operation entries:', err);
        this.error.set('Failed to load operation entries');
        this.loading.set(false);
      }
    });
  }

  private mapApiDataToEntryCards(apiData: OperationEntry[]): EntryCard[] {
    return apiData.map(entry => {
      const visual = this.entryVisuals[entry.key] || {
        icon: '📋',
        desc: entry.displayName,
        gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
        route: `/operation/entries/${entry.key}`
      };

      return {
        key: entry.key,
        label: entry.displayName,
        route: visual.route,
        icon: visual.icon,
        desc: visual.desc,
        gradient: visual.gradient
      };
    });
  }

  get filteredEntries(): EntryCard[] {
    const currentEntries = this.entries();
    if (!this.searchTerm) return currentEntries;
    const term = this.searchTerm.toLowerCase();
    return currentEntries.filter(e =>
      e.label.toLowerCase().includes(term) || e.desc.toLowerCase().includes(term)
    );
  }

  openEntry(entry: EntryCard): void {
    this.router.navigate([entry.route]);
  }

  retryLoading(): void {
    this.loadOperationEntries();
  }
}
