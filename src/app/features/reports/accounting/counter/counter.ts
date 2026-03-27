import { Component } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-counter',
  standalone: false,
  templateUrl: './counter.html',
  styleUrl: './counter.scss',
})
export class Counter {

  filters: any = (() => {
    const today = new Date().toISOString().split('T')[0];
    return { fromDate: today, toDate: today };
  })();

  constructor(private reportService: ReportService) {}

  handleView(filters: any) {
    this.downloadReport('/api/TreasuryCounterReport/pdf', true, filters);
  }

  handlePdf(filters: any) {
    this.downloadReport('/api/TreasuryCounterReport/pdf', false, filters);
  }

  handleExcel(filters: any) {
    this.downloadReport('/api/TreasuryCounterReport/excel', false, filters);
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

  triggerView() { this.handleView(this.getCleanedFilters()); }
  triggerPdf()  { this.handlePdf(this.getCleanedFilters()); }
  triggerExcel(){ this.handleExcel(this.getCleanedFilters()); }

  private downloadReport(endpoint: string, openInNewTab: boolean, filtersPayload: any) {
    this.reportService.downloadReport(endpoint, filtersPayload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        if (openInNewTab) {
          window.open(url, '_blank');
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'TreasuryCounterReport' + (endpoint.endsWith('excel') ? '.xlsx' : '.pdf');
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
