import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';
import { AccountingService } from '../../../../core/services/accounting.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-tax-transaction',
  standalone: false,
  templateUrl: './tax-transaction.html',
  styleUrl: './tax-transaction.scss',
})
export class TaxTransaction implements OnInit {

  filters: any = (() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      fromDate: today,
      toDate: today,
      branchName: '',
      receiptNo: '',
      taxNo: '',
      currency: ''
    };
  })();

  receipts: string[] = [];
  currencyOptions: string[] = ['EGP', 'USD', 'EUR', 'GBP'];

  constructor(
    private reportService: ReportService,
    private accountingService: AccountingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.accountingService.searchTreasuryTransactions().pipe(catchError(() => of([]))).subscribe(transactions => {
      const rawReceipts = transactions.map((t: any) => t.receiptNo).filter((r: any) => !!r) as string[];
      this.receipts = Array.from(new Set(rawReceipts)).sort((a, b) => b.localeCompare(a));
      this.cdr.detectChanges();
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

  triggerPdf() {
    this.reportService.downloadReport('/api/TreasuryTaxReport/pdf', this.getCleanedFilters()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      },
      error: (err) => console.error('Failed to download PDF', err)
    });
  }

  triggerExcel() {
    this.reportService.downloadReport('/api/TreasuryTaxReport/excel', this.getCleanedFilters()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TreasuryTaxReport.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Failed to download Excel', err)
    });
  }
}
