import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';
import { AccountingService } from '../../../../core/services/accounting.service';
import { OperationAccount, CodeFileNumber } from '../../../../core/interfaces/code.interfaces';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-file-service-subsidiary-ledger',
  standalone: false,
  templateUrl: './file-service-subsidiary-ledger.html',
  styleUrl: './file-service-subsidiary-ledger.scss',
})
export class FileServiceSubsidiaryLedger implements OnInit {

  filters: any = (() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      fromDate: today,
      toDate: today,
      receiptNo: '',
      transactionType: '',
      fromAccount: '',
      toAccount: '',
      fromFileNumber: '',
      toFileNumber: '',
      fromService: '',
      toService: '',
      branch: '',
      currency: '',
      search: '',
      page: 1,
      pageSize: 50
    };
  })();

  accounts: OperationAccount[] = [];
  fileNumbers: CodeFileNumber[] = [];
  receipts: string[] = [];

  currencyOptions: string[] = ['EGP', 'USD', 'EUR', 'GBP'];
  transactionTypeOptions = [
    { value: 'Revenue', label: 'Revenue' },
    { value: 'Expense', label: 'Expense' },
    { value: 'Advance', label: 'Advance' },
    { value: 'Advance Settlement', label: 'Advance Settlement' },
    { value: 'Due', label: 'Due' },
  ];

  data: any = null;
  loading = false;

  constructor(
    private reportService: ReportService,
    private accountingService: AccountingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns(): void {
    forkJoin({
      accounts: this.accountingService.getAllAccountsFlat().pipe(catchError(() => of([]))),
      fileNumbers: this.accountingService.getCodeFileNumbers().pipe(catchError(() => of([]))),
      transactions: this.accountingService.searchTreasuryTransactions().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.accounts = res.accounts;
        this.fileNumbers = res.fileNumbers;
        const rawReceipts = res.transactions.map((t: any) => t.receiptNo).filter((r: any) => !!r) as string[];
        this.receipts = Array.from(new Set(rawReceipts)).sort((a, b) => b.localeCompare(a));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading dropdowns', err)
    });
  }

  private getCleanedFilters(): any {
    const cleaned: any = {};
    for (const key in this.filters) {
      const val = this.filters[key];
      if (val !== undefined && val !== null && val !== '') {
        cleaned[key] = val;
      }
    }
    return cleaned;
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.triggerView(false);
  }

  onPageSizeChange(size: number): void {
    this.filters.pageSize = size;
    this.filters.page = 1;
    this.triggerView(false);
  }

  triggerView(resetPage = true) {
    if (resetPage) {
      this.filters.page = 1;
    }
    this.loading = true;
    this.reportService.getReportData<any>('/api/FileNumberSubsidiaryLedgerReport/data', this.getCleanedFilters()).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  triggerExcel() {
    this.reportService.downloadReport('/api/FileNumberSubsidiaryLedgerReport/excel', this.getCleanedFilters()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'FileNumberSubsidiaryLedgerReport.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Failed to download excel', err)
    });
  }
}
