import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ReportService, ReportDefinition } from '../../../core/services/report.service';

interface ReportCard {
  key: string;
  label: string;
  route: string;
  icon: string;
  desc: string;
  gradient: string;
}

@Component({
  selector: 'app-accounting-reports',
  standalone: false,
  templateUrl: './accounting-reports.html',
  styleUrl: './accounting-reports.scss'
})
export class AccountingReports implements OnInit {
  searchTerm = '';
  isLoading = true;
  reports: ReportCard[] = [];

  private reportMetadata: Record<string, { icon: string; desc: string; gradient: string; }> = {
    codesreports: { icon: '🏷️', desc: 'Codes Reports', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    counter: { icon: '🔢', desc: 'Counter', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
    transaction: { icon: '🔄', desc: 'Transaction', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
    taxtransaction: { icon: '🧾', desc: 'Tax Transaction', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
    supplierbalance: { icon: '⚖️', desc: 'Supplier Balance', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
    accountbalance: { icon: '🏦', desc: 'Account Balance', gradient: 'linear-gradient(135deg, #f6d365, #fda085)' },
    genralfollow: { icon: '📈', desc: 'General Follow', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    cashbalance: { icon: '💵', desc: 'Cash Balance', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
    searchmovements: { icon: '🔍', desc: 'Search Movements', gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)' },
    genralsubsidiaryledger: { icon: '📔', desc: 'General Subsidiary Ledger', gradient: 'linear-gradient(135deg, #d4fc79, #96e6a1)' },
    accountsubsidiaryledger: { icon: '📓', desc: 'Account Subsidiary Ledger', gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)' },
    fileservicesubsidiaryledger: { icon: '📂', desc: 'File Service Subsidiary Ledger', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)' },
    costcentersubsidiaryledger: { icon: '🏢', desc: 'Cost Center Subsidiary Ledger', gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)' },
    deletedsubsidiaryledger: { icon: '🗑️', desc: 'Deleted Subsidiary Ledger', gradient: 'linear-gradient(135deg, #c2e59c, #64b3f4)' },
    fileprofitandloss: { icon: '📊', desc: 'File Profit And Loss', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
    profitandloss: { icon: '📉', desc: 'Profit And Loss', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    trialbalance: { icon: '⚖️', desc: 'Trial Balance', gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)' }
  };

  constructor(
    private reportService: ReportService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.reportService.getAccountingReports().subscribe({
      next: (data) => {
        this.reports = this.mapReports(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading accounting reports', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapReports(definitions: ReportDefinition[]): ReportCard[] {
    return definitions.map(def => {
      const meta = this.reportMetadata[def.key] || {
        icon: '📋',
        desc: def.displayName,
        gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
      };
      
      let folderName = def.key;
      const folderMap: Record<string, string> = {
        'taxtransaction': 'tax-transaction',
        'supplierbalance': 'supplier-balance',
        'accountbalance': 'account-balance',
        'genralfollow': 'general-follow',
        'cashbalance': 'cash-balance',
        'searchmovements': 'search-movements',
        'genralsubsidiaryledger': 'general-subsidiary-ledger',
        'accountsubsidiaryledger': 'account-subsidiary-ledger',
        'fileservicesubsidiaryledger': 'file-service-subsidiary-ledger',
        'costcentersubsidiaryledger': 'cost-center-subsidiary-ledger',
        'deletedsubsidiaryledger': 'deleted-subsidiary-ledger',
        'fileprofitandloss': 'file-profit-and-loss',
        'profitandloss': 'profit-and-loss',
        'trialbalance': 'trial-balance',
        'codesreports': 'codes-reports'
      };
      if (folderMap[def.key]) {
        folderName = folderMap[def.key];
      }

      return {
        key: def.key,
        label: def.displayName,
        route: `/accounting/reports/${folderName}`,
        icon: meta.icon,
        desc: meta.desc,
        gradient: meta.gradient
      };
    });
  }

  get filteredReports() {
    if (!this.searchTerm) return this.reports;
    const term = this.searchTerm.toLowerCase();
    return this.reports.filter(c => c.label.toLowerCase().includes(term) || c.desc.toLowerCase().includes(term));
  }

  openReport(report: ReportCard): void {
    this.router.navigate([report.route]);
  }
}
