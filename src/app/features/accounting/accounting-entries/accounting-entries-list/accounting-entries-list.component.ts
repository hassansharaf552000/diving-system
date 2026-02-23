import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { AccountingService, AccountingEntry } from '../../../../core/services/accounting.service';

@Component({
  selector: 'app-accounting-entries-list',
  standalone: false,
  templateUrl: './accounting-entries-list.component.html',
  styleUrl: './accounting-entries-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountingEntriesListComponent implements OnInit {
  private readonly accountingService = inject(AccountingService);
  
  protected readonly accountingEntries = signal<AccountingEntry[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAccountingEntries();
  }

  loadAccountingEntries(): void {
    this.loading.set(true);
    this.accountingService.getAccountingEntries().subscribe({
      next: (entries) => {
        this.accountingEntries.set(entries);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading accounting entries:', err);
        this.error.set('Failed to load accounting entries');
        this.loading.set(false);
      }
    });
  }
}