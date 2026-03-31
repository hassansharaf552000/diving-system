import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReportService } from '../../../../core/services/report.service';
import { AccountingService } from '../../../../core/services/accounting.service';
import { OperationAccount, CodeBeneficiaryName, CodeBeneficiaryType } from '../../../../core/interfaces/code.interfaces';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-search-movements',
  standalone: false,
  templateUrl: './search-movements.html',
  styleUrl: './search-movements.scss',
})
export class SearchMovements implements OnInit {

  filters: any = (() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      fromDate: today,
      toDate: today,
      branch: 'DiveUp & FunUp',
      searchTerm: '',
      currency: '',
      transactionType: '',
      accountId: '',
      receiptNo: '',
      beneficiaryNameId: '',
      beneficiaryType: ''
    };
  })();

  accounts: OperationAccount[] = [];
  beneficiaryNames: CodeBeneficiaryName[] = [];
  beneficiaryTypes: CodeBeneficiaryType[] = [];
  receipts: string[] = [];
  
  currencyOptions: string[] = ['EGP', 'USD', 'EUR', 'GBP'];
  transactionTypeOptions = [
    { value: 1, label: 'Revenue' },
    { value: 2, label: 'Expense' },
    { value: 3, label: 'Advance' },
    { value: 4, label: 'Advance Settlement' },
    { value: 5, label: 'Due' },
  ];

  data: any = null;
  loading = false;

  constructor(
    private reportService: ReportService,
    private accountingService: AccountingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns(): void {
    forkJoin({
      accounts: this.accountingService.getAllAccountsFlat().pipe(catchError(() => of([]))),
      beneficiaryNames: this.accountingService.getCodeBeneficiaryNames().pipe(catchError(() => of([]))),
      beneficiaryTypes: this.accountingService.getCodeBeneficiaryTypes().pipe(catchError(() => of([]))),
      transactions: this.accountingService.searchTreasuryTransactions().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.accounts = res.accounts;
        this.beneficiaryNames = res.beneficiaryNames;
        this.beneficiaryTypes = res.beneficiaryTypes;
        
        // Extract unique, non-empty receipt numbers from Treasury Transactions
        const rawReceipts = res.transactions.map(t => t.receiptNo).filter(r => !!r) as string[];
        this.receipts = Array.from(new Set(rawReceipts)).sort((a, b) => b.localeCompare(a)); // sort descending

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading dropdowns', err)
    });
  }

  private getCleanedFilters(): any {
    const cleaned: any = {};
    for (const key in this.filters) {
      if (this.filters[key] !== undefined && this.filters[key] !== null && this.filters[key] !== '') {
        // Do not send the default 'DiveUp & FunUp' branch in the payload
        if (key === 'branch' && this.filters[key] === 'DiveUp & FunUp') {
          continue;
        }
        cleaned[key] = this.filters[key];
      }
    }
    return cleaned;
  }

  triggerView() {
    this.loading = true;
    this.reportService.getReportData<any>('/api/MovementsSearchReport/data', this.getCleanedFilters()).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  triggerExcel() {
    this.reportService.downloadReport('/api/MovementsSearchReport/excel', this.getCleanedFilters()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'MovementsSearchReport.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error('Failed to download excel', err)
    });
  }
}
