import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profit-and-loss',
  standalone: false,
  templateUrl: './profit-and-loss.html',
  styleUrl: './profit-and-loss.scss',
})
export class ProfitAndLoss {

  private auth = inject(AuthService);

  filters: any = {
    year: new Date().getFullYear(),
    fromMonth: 1,
    toMonth: 12,
    branch: '',
    recordBy: this.auth?.currentUser()?.userName || ''
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
    this.reportService.downloadReport('/api/ProfitAndLossReport/pdf', this.getCleanedFilters()).subscribe({
      next: (blob) => { const url = window.URL.createObjectURL(blob); window.open(url, '_blank'); setTimeout(() => window.URL.revokeObjectURL(url), 5000); },
      error: (err) => console.error('Failed to open PDF', err)
    });
  }

  downloadPdf() {
    this.reportService.downloadReport('/api/ProfitAndLossReport/pdf', this.getCleanedFilters()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'ProfitAndLossReport.pdf';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Failed to download PDF', err)
    });
  }

  triggerExcel() {
    this.reportService.downloadReport('/api/ProfitAndLossReport/excel', this.getCleanedFilters()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'ProfitAndLossReport.xlsx';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Failed to download Excel', err)
    });
  }
}
