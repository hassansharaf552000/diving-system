import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService, AccountingEntry } from '../../../../core/services/accounting.service';

interface EntryCard {
  key: string;
  displayName: string;
  icon: string;
  desc: string;
  gradient: string;
  route: string;
}

@Component({
  selector: 'app-accounting-entries-list',
  standalone: false,
  templateUrl: './accounting-entries-list.component.html',
  styleUrl: './accounting-entries-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountingEntriesListComponent implements OnInit {
  private readonly accountingService = inject(AccountingService);
  private readonly router = inject(Router);
  
  protected readonly entries = signal<EntryCard[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Visual + route mapping for accounting entry types
  private readonly entryVisuals: Record<string, { icon: string; desc: string; gradient: string; route: string }> = {
    'entrytreasurytransaction': {
      icon: '💳',
      desc: 'Treasury transaction management',
      gradient: 'linear-gradient(135deg, #f6d365, #fda085)',
      route: '/accounting/entries/entrytreasurytransaction'
    },
    'entrycounter': {
      icon: '🏦',
      desc: 'Treasury counter and denomination tracking',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      route: '/accounting/entries/entrycounter'
    },
    'followcollection': {
      icon: '📥',
      desc: 'Follow up on collections',
      gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
      route: '/accounting/entries/followcollection'
    },
    'followpayment': {
      icon: '📤',
      desc: 'Follow up on payments',
      gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      route: '/accounting/entries/followpayment'
    },
    'updatetransactionsrate': {
      icon: '💱',
      desc: 'Update transaction exchange rates',
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      route: '/accounting/entries/updatetransactionsrate'
    },
    'posttransactions': {
      icon: '📮',
      desc: 'Post pending transactions',
      gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
      route: '/accounting/entries/posttransactions'
    }
  };

  private readonly defaultGradients = [
    'linear-gradient(135deg, #a8edea, #fed6e3)',
    'linear-gradient(135deg, #ffecd2, #fcb69f)',
    'linear-gradient(135deg, #89f7fe, #66a6ff)',
    'linear-gradient(135deg, #c3cfe2, #f5f7fa)'
  ];

  ngOnInit(): void {
    this.loadAccountingEntries();
  }

  loadAccountingEntries(): void {
    this.loading.set(true);
    this.error.set(null);
    this.accountingService.getAccountingEntries().subscribe({
      next: (apiEntries) => {
        const mapped = apiEntries.map((entry, i) => {
          const visual = this.entryVisuals[entry.key.toLowerCase()] || {
            icon: '📋',
            desc: entry.displayName,
            gradient: this.defaultGradients[i % this.defaultGradients.length],
            route: `/accounting/entries/${entry.key}`
          };
          return {
            key: entry.key,
            displayName: entry.displayName,
            icon: visual.icon,
            desc: visual.desc,
            gradient: visual.gradient,
            route: visual.route
          };
        });
        this.entries.set(mapped);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading accounting entries:', err);
        this.error.set('Failed to load accounting entries');
        this.loading.set(false);
      }
    });
  }

  openEntry(entry: EntryCard): void {
    this.router.navigate([entry.route]);
  }
}