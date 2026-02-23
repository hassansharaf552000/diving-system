import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { AccountingService, AccountingCode } from '../../../../core/services/accounting.service';

@Component({
  selector: 'app-accounting-codes-list',
  standalone: false,
  templateUrl: './accounting-codes-list.component.html',
  styleUrl: './accounting-codes-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountingCodesListComponent implements OnInit {
  private readonly accountingService = inject(AccountingService);
  
  protected readonly accountingCodes = signal<AccountingCode[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAccountingCodes();
  }

  loadAccountingCodes(): void {
    this.loading.set(true);
    this.accountingService.getAccountingCodes().subscribe({
      next: (codes) => {
        this.accountingCodes.set(codes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading accounting codes:', err);
        this.error.set('Failed to load accounting codes');
        this.loading.set(false);
      }
    });
  }
}