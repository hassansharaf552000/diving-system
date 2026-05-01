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
    reportBy: 'Month',
    page: 1,
    pageSize: 50
  };

  reportData: any = null;
  loading = false;

  tableColumns: any[] = [];

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

  onPageChange(page: number): void {
    this.filters.page = page;
    this.updatePagedRows();
    this.cdr.detectChanges();
  }

  onPageSizeChange(size: number): void {
    this.filters.pageSize = size;
    this.filters.page = 1;
    this.updatePagedRows();
    this.cdr.detectChanges();
  }

  updatePagedRows() {
    if (!this.reportData || !this.reportData.allRows) return;
    const startIndex = (this.filters.page - 1) * this.filters.pageSize;
    const endIndex = startIndex + this.filters.pageSize;
    this.reportData.rows = this.reportData.allRows.slice(startIndex, endIndex);
  }

  fetchData(resetPage = true) {
    if (resetPage) {
      this.filters.page = 1;
    }
    this.loading = true;
    this.reportData = null;
    this.reportService.getReportData<any>('/api/TouristicFileSubsidiaryReport/data', this.getCleanedFilters()).subscribe({
      next: (res) => {
        const flatRows: any[] = [];
        if (res && res.branches) {
          res.branches.forEach((b: any) => {
            const branchName = b.branch;
            const groups = b.months || b.agents || b.files || [];
            
            groups.forEach((g: any) => {
              const groupVal = g.month || g.agentName || g.fileNumber || g.agent || g.file || '-';
              if (g.services) {
                g.services.forEach((s: any) => {
                  flatRows.push({
                    branch: branchName,
                    group: groupVal,
                    accountName: s.accountName,
                    revenue: s.revenue,
                    cost: s.expense,
                    profit: s.pl,
                    margin: s.plPercent
                  });
                });
              }
            });
          });
        }

        const groupLabel = this.filters.reportBy || 'Group';
        this.tableColumns = [
          { key: 'branch',       label: 'Branch' },
          { key: 'group',        label: groupLabel },
          { key: 'accountName',  label: 'Account Name' },
          { key: 'revenue',      label: 'Revenue' },
          { key: 'cost',         label: 'Cost' },
          { key: 'profit',       label: 'Profit' },
          { key: 'margin',       label: 'Margin %' }
        ];

        this.reportData = {
          allRows: flatRows,
          rows: [],
          totals: {
            revenue: res?.grandRevenue || 0,
            cost: res?.grandExpense || 0,
            profit: res?.grandPL || 0,
            margin: res?.grandPLPct || 0
          },
          totalCount: flatRows.length
        };
        
        this.updatePagedRows();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load report data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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
