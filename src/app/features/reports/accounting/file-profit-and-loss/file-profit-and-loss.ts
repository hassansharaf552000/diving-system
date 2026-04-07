import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';
import { AccountingService } from '../../../../core/services/accounting.service';
import { CodeAgent, CodeFileNumber, OperationAccount } from '../../../../core/interfaces/code.interfaces';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-file-profit-and-loss',
  standalone: false,
  templateUrl: './file-profit-and-loss.html',
  styleUrl: './file-profit-and-loss.scss',
})
export class FileProfitAndLoss implements OnInit {

  filters: any = {
    year: new Date().getFullYear(),
    fromMonth: 1,
    toMonth: 12,
    branch: '',
    agentId: '',
    fileNumberId: '',
    serviceAccountId: '',
    reportGroup: 'Details',
    reportBy: 'Month'
  };

  agents: CodeAgent[] = [];
  fileNumbers: CodeFileNumber[] = [];
  accounts: OperationAccount[] = [];

  monthOptions = [
    { value: 1, label: '01 - January' },
    { value: 2, label: '02 - February' },
    { value: 3, label: '03 - March' },
    { value: 4, label: '04 - April' },
    { value: 5, label: '05 - May' },
    { value: 6, label: '06 - June' },
    { value: 7, label: '07 - July' },
    { value: 8, label: '08 - August' },
    { value: 9, label: '09 - September' },
    { value: 10, label: '10 - October' },
    { value: 11, label: '11 - November' },
    { value: 12, label: '12 - December' },
  ];

  yearOptions: number[] = [];

  reportGroupOptions = ['Details', 'Summary'];
  reportByOptions = ['Month', 'Agent', 'File'];

  constructor(
    private reportService: ReportService,
    private accountingService: AccountingService,
    private cdr: ChangeDetectorRef
  ) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      this.yearOptions.push(y);
    }
  }

  ngOnInit(): void {
    forkJoin({
      agents: this.accountingService.getCodeAgents().pipe(catchError(() => of([]))),
      fileNumbers: this.accountingService.getCodeFileNumbers().pipe(catchError(() => of([]))),
      accounts: this.accountingService.getAllAccountsFlat().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.agents = res.agents;
        this.fileNumbers = res.fileNumbers;
        this.accounts = res.accounts;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading dropdowns', err)
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
    this.reportService.downloadReport('/api/TouristicFileSubsidiaryReport/pdf', this.getCleanedFilters()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      },
      error: (err) => console.error('Failed to open PDF', err)
    });
  }

  downloadPdf() {
    this.reportService.downloadReport('/api/TouristicFileSubsidiaryReport/pdf', this.getCleanedFilters()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TouristicFileSubsidiaryReport.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Failed to download PDF', err)
    });
  }

  triggerExcel() {
    this.reportService.downloadReport('/api/TouristicFileSubsidiaryReport/excel', this.getCleanedFilters()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TouristicFileSubsidiaryReport.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Failed to download Excel', err)
    });
  }
}
