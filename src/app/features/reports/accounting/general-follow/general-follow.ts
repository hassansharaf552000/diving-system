import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-general-follow',
  standalone: false,
  templateUrl: './general-follow.html',
  styleUrl: './general-follow.scss',
})
export class GeneralFollow implements OnInit {

  filters: any = {
    fromDate: '',
    toDate: '',
    currency: ''
  };

  reportData: any = null;
  loading = false;
  
  tableColumns = [
    { key: 'beneficiaryId', label: 'ID', sortable: true },
    { key: 'beneficiary', label: 'Beneficiary', sortable: true },
    { key: 'currency', label: 'Currency', sortable: true },
    { key: 'totalAdvanced', label: 'Total Advanced', sortable: true },
    { key: 'totalSettled', label: 'Total Settled', sortable: true },
    { key: 'netBalance', label: 'Net Balance', sortable: true }
  ];

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.filters.fromDate = today;
    this.filters.toDate = today;
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

  fetchData() {
    this.loading = true;
    this.reportData = null;
    this.reportService.getReportData<any>('/api/GeneralFlowReport/data', this.getCleanedFilters()).subscribe({
      next: (res) => {
        this.reportData = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  triggerPdf() {
    this.reportService.downloadReport('/api/GeneralFlowReport/pdf', this.getCleanedFilters()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      },
      error: (err) => console.error(err)
    });
  }

  triggerExcel() {
    this.reportService.downloadReport('/api/GeneralFlowReport/excel', this.getCleanedFilters()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'GeneralFlowReport.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error(err)
    });
  }
}
