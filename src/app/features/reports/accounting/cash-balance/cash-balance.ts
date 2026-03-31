import { Component } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-cash-balance',
  standalone: false,
  templateUrl: './cash-balance.html',
  styleUrl: './cash-balance.scss',
})
export class CashBalance {

  constructor(private reportService: ReportService) {}

  triggerView() {
    this.downloadReport('/api/CashBalanceReport/pdf', true);
  }

  triggerPdf() {
    this.downloadReport('/api/CashBalanceReport/pdf', false);
  }

  triggerExcel() {
    this.downloadReport('/api/CashBalanceReport/excel', false);
  }

  private downloadReport(endpoint: string, openInNewTab: boolean) {
    this.reportService.downloadReport(endpoint, {}).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        if (openInNewTab) {
          window.open(url, '_blank');
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'CashBalanceReport' + (endpoint.endsWith('excel') ? '.xlsx' : '.pdf');
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
