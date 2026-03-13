import { Component } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-invoice-transportation-supplier',
  standalone: false,
  templateUrl: './invoice-transportation-supplier.html',
  styleUrl: './invoice-transportation-supplier.scss',
})
export class InvoiceTransportationSupplier {

  invoiceFilters: any = {
    reportType: 'Details' // Default value matching screenshot
  };

  invoiceFields = [
    'fromDate', 'toDate', 'agentId', 'excursionSupplierId', 'boatId', 
    'transportationSupplierId', 'carTypeId', 'orderNumber', 'reportType'
  ];

  reportTypeOptions = ['Details', 'Totals'];

  constructor(private reportService: ReportService) {}

  handleView(cleanedFilters: any) {
    this.downloadReport('/api/TransportationSupplierInvoiceReport/pdf', true, cleanedFilters);
  }

  handlePdf(cleanedFilters: any) {
    this.downloadReport('/api/TransportationSupplierInvoiceReport/pdf', false, cleanedFilters);
  }

  handleExcel(cleanedFilters: any) {
    this.downloadReport('/api/TransportationSupplierInvoiceReport/excel', false, cleanedFilters);
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
          let filename = 'TransportationSupplierInvoiceReport' + (endpoint.endsWith('excel') ? '.xlsx' : '.pdf');
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
