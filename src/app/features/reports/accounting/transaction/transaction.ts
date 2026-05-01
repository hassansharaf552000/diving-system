import { Component } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-transaction',
  standalone: false,
  templateUrl: './transaction.html',
  styleUrl: './transaction.scss',
})
export class Transaction {

  filters: any = (() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      fromDate: today,
      toDate: today,
      reportName: 'TreasuryMovements',
      reportBy: 'TransactionDate',
      type: '',
      receiptNo: '',
      currency: ''
    };
  })();

  transactionTypeOptions = [
    { value: 1, label: 'Revenue' },
    { value: 2, label: 'Expense' },
    { value: 3, label: 'Advance' },
    { value: 4, label: 'Advance Settlement' },
    { value: 5, label: 'Due' },
  ];

  currencyOptions: string[] = ['EGP', 'USD', 'EUR', 'GBP'];

  reportNameOptions = [
    { value: 'TreasuryMovements', label: 'Treasury Movements' },
    { value: 'CashReceipt', label: 'Cash Receipt' },
    { value: 'GeneralLedger', label: 'General Ledger' },
  ];

  reportByOptions = [
    { value: 'TransactionDate', label: 'Transaction Date' },
    { value: 'EntryDate', label: 'Entry Date' },
    { value: 'LastUpdateDate', label: 'Last Update Date' },
  ];

  constructor(private reportService: ReportService) {}

  private getCleanedFilters(): any {
    const cleaned: any = {};
    for (const key in this.filters) {
      if (
        this.filters[key] !== undefined &&
        this.filters[key] !== null &&
        this.filters[key] !== ''
      ) {
        cleaned[key] = this.filters[key];
      }
    }
    return cleaned;
  }

  triggerView()  { this.downloadReport('/api/TreasuryTransactionReport/pdf',   true,  this.getCleanedFilters()); }
  triggerPdf()   { this.downloadReport('/api/TreasuryTransactionReport/pdf',   false, this.getCleanedFilters()); }
  triggerExcel() { this.downloadReport('/api/TreasuryTransactionReport/excel', false, this.getCleanedFilters()); }

  private downloadReport(endpoint: string, openInNewTab: boolean, filtersPayload: any) {
    this.reportService.downloadReport(endpoint, filtersPayload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        if (openInNewTab) {
          window.open(url, '_blank');
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'TreasuryTransactionReport' + (endpoint.endsWith('excel') ? '.xlsx' : '.pdf');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => {
        console.error('Failed to download report', err);
      }
    });
  }
}
