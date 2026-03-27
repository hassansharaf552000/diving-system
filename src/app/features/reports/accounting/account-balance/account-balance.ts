import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';
import { AccountingService } from '../../../../core/services/accounting.service';
import { OperationAccount } from '../../../../core/interfaces/code.interfaces';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-account-balance',
  standalone: false,
  templateUrl: './account-balance.html',
  styleUrl: './account-balance.scss',
})
export class AccountBalance implements OnInit {

  filters: any = (() => {
    const today = new Date().toISOString().split('T')[0];
    return { fromDate: today, toDate: today };
  })();

  accounts: OperationAccount[] = [];
  receipts: string[] = [];
  loadingAccounts = true;

  transactionTypeOptions = [
    { value: 1, label: 'Advance' },
    { value: 2, label: 'Advance Settlement' },
    { value: 3, label: 'Expense' },
    { value: 4, label: 'Revenue' },
  ];

  constructor(
    private reportService: ReportService,
    private accountingService: AccountingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.accountingService.getAllAccountsFlat()
      .pipe(catchError(err => { console.error('Accounts error', err); return of([]); }))
      .subscribe((accounts: OperationAccount[]) => {
        this.accounts = accounts;
        this.loadingAccounts = false;
        this.cdr.detectChanges();
      });
  }

  onAccountChange(): void {
    this.filters.receiptNo = '';
    this.receipts = [];
    this.loadReceipts();
  }

  onTransactionTypeChange(): void {
    this.filters.receiptNo = '';
    this.receipts = [];
    if (this.filters.accountId) {
      this.loadReceipts();
    }
  }

  private loadReceipts(): void {
    const accountId = Number(this.filters.accountId);
    if (!accountId) return;
    const transactionType = this.filters.transactionType ? Number(this.filters.transactionType) : undefined;
    this.reportService.getAccountBalanceReceipts(accountId, transactionType).subscribe({
      next: (receipts) => this.receipts = receipts,
      error: (err) => console.error('Failed to load receipts', err)
    });
  }

  private getCleanedFilters(): any {
    const cleaned: any = {};
    for (const key in this.filters) {
      if (this.filters[key] !== undefined && this.filters[key] !== null && this.filters[key] !== '') {
        cleaned[key] = this.filters[key];
      }
    }
    return cleaned;
  }

  triggerView()  { this.downloadReport('/api/AccountBalanceReport/pdf', true, this.getCleanedFilters()); }
  triggerPdf()   { this.downloadReport('/api/AccountBalanceReport/pdf', false, this.getCleanedFilters()); }
  triggerExcel() { this.downloadReport('/api/AccountBalanceReport/excel', false, this.getCleanedFilters()); }

  private downloadReport(endpoint: string, openInNewTab: boolean, filtersPayload: any) {
    this.reportService.downloadReport(endpoint, filtersPayload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        if (openInNewTab) {
          window.open(url, '_blank');
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'AccountBalanceReport' + (endpoint.endsWith('excel') ? '.xlsx' : '.pdf');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Failed to download report', err)
    });
  }
}
