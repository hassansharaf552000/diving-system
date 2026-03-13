import { Component } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-invoice-boat-supplier',
  standalone: false,
  templateUrl: './invoice-boat-supplier.html',
  styleUrl: './invoice-boat-supplier.scss',
})
export class InvoiceBoatSupplier {

  invoiceFilters: any = {
    report: 'Boat Cost', // Default value matching screenshot
    reportType: 'Details' // Default value matching screenshot
  };

  invoiceFields = [
    'fromDate', 'toDate', 'excursionId', 'priceListId', 'agentId', 
    'nationalityId', 'excursionSupplierId', 'boatId', 'report', 'reportType'
  ];

  reportOptions = ['Boat Cost', 'Permission', 'National Fee'];
  reportTypeOptions = ['Details', 'Totals', 'Receipt'];

  constructor(private reportService: ReportService) {}

  handleView(cleanedFilters: any) {
    this.downloadReport('/api/BoatSupplierInvoiceReport/pdf', true, cleanedFilters);
  }

  handlePdf(cleanedFilters: any) {
    this.downloadReport('/api/BoatSupplierInvoiceReport/pdf', false, cleanedFilters);
  }

  handleExcel(cleanedFilters: any) {
    this.downloadReport('/api/BoatSupplierInvoiceReport/excel', false, cleanedFilters);
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
          let filename = 'BoatSupplierInvoiceReport' + (endpoint.endsWith('excel') ? '.xlsx' : '.pdf');
          a.download = filename;
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
