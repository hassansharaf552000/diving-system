import { Component, ChangeDetectorRef } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-trial-balance',
  standalone: false,
  templateUrl: './trial-balance.html',
  styleUrl: './trial-balance.scss',
})
export class TrialBalance {

  filters: any = {
    year: new Date().getFullYear(),
    fromMonth: 1,
    toMonth: 12,
    currency: '',
    branch: ''
  };

  monthOptions = [
    { value: 1, label: '01 - January' }, { value: 2, label: '02 - February' },
    { value: 3, label: '03 - March' },   { value: 4, label: '04 - April' },
    { value: 5, label: '05 - May' },     { value: 6, label: '06 - June' },
    { value: 7, label: '07 - July' },    { value: 8, label: '08 - August' },
    { value: 9, label: '09 - September' }, { value: 10, label: '10 - October' },
    { value: 11, label: '11 - November' }, { value: 12, label: '12 - December' },
  ];

  yearOptions: number[] = [];
  currencyOptions: string[] = ['EGP', 'USD', 'EUR', 'GBP'];

  constructor(private reportService: ReportService, private cdr: ChangeDetectorRef) {
    const y = new Date().getFullYear();
    for (let i = y; i >= y - 5; i--) this.yearOptions.push(i);
  }

  private getCleanedFilters(): any {
    const cleaned: any = {};
    for (const key in this.filters) {
      const val = this.filters[key];
      if (val !== undefined && val !== null && val !== '') cleaned[key] = val;
    }
    return cleaned;
  }

  triggerPdf() {
    this.reportService.downloadReport('/api/TrialBalanceReport/pdf', this.getCleanedFilters()).subscribe({
      next: (blob) => { const url = window.URL.createObjectURL(blob); window.open(url, '_blank'); setTimeout(() => window.URL.revokeObjectURL(url), 5000); },
      error: (err) => console.error('Failed to open PDF', err)
    });
  }

  downloadPdf() {
    this.reportService.downloadReport('/api/TrialBalanceReport/pdf', this.getCleanedFilters()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'TrialBalanceReport.pdf';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Failed to download PDF', err)
    });
  }

  triggerExcel() {
    this.reportService.downloadReport('/api/TrialBalanceReport/excel', this.getCleanedFilters()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'TrialBalanceReport.xlsx';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Failed to download Excel', err)
    });
  }
}
