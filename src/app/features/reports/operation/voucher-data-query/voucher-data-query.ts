import { Component } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-voucher-data-query',
  standalone: false,
  templateUrl: './voucher-data-query.html',
  styleUrl: './voucher-data-query.scss',
})
export class VoucherDataQuery {

  filters: any = {
    reportBy: 'ExcursionDate',
    groupBy: 'Agent',
    reportType: 'Details',
    paidType: 'All',
  };

  showFields = [
    'fromDate', 'toDate',
    'reportBy', 'voucherNumber',
    'agentId', 'repId',
    'hotelId', 'excursionId', 'excursionSupplierId',
    'groupBy', 'reportType', 'paidType',
  ];

  reportByOptions = ['ExcursionDate', 'RevenueDate', 'RefundDate'];
  groupByOptions  = ['Agent', 'Rep'];
  reportTypeOptions = ['Details', 'Totals', 'Vouchers'];
  paidTypeOptions = ['All', 'Paid', 'NotPaid'];

  constructor(private reportService: ReportService) {}

  handleView(cleanedFilters: any) {
    this.downloadReport('/api/VoucherQueryReport/pdf', true, cleanedFilters);
  }

  handlePdf(cleanedFilters: any) {
    this.downloadReport('/api/VoucherQueryReport/pdf', false, cleanedFilters);
  }

  handleExcel(cleanedFilters: any) {
    this.downloadReport('/api/VoucherQueryReport/excel', false, cleanedFilters);
  }

  private downloadReport(endpoint: string, openInNewTab: boolean, filtersPayload: any) {
    this.reportService.downloadReport(endpoint, filtersPayload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        if (openInNewTab) {
          window.open(url, '_blank');
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'VoucherQueryReport' + (endpoint.endsWith('excel') ? '.xlsx' : '.pdf');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => {
        console.error('Failed to download voucher query report', err);
      }
    });
  }
}

