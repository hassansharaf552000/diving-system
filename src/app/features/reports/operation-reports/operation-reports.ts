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
  selector: 'app-operation-reports',
  standalone: false,
  templateUrl: './operation-reports.html',
  styleUrl: './operation-reports.scss'
})
export class OperationReports implements OnInit {
  searchTerm = '';
  isLoading = true;
  reports: ReportCard[] = [];

  private reportMetadata: Record<string, { icon: string; desc: string; gradient: string; }> = {
    codesreports: { icon: '🏷️', desc: 'Codes Reports', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    traffic: { icon: '🚦', desc: 'Traffic', gradient: 'linear-gradient(135deg, #f6d365, #fda085)' },
    invoiceagent: { icon: '🏢', desc: 'Invoice Agent', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
    invoiceboatsupplier: { icon: '🚢', desc: 'Invoice Boat Supplier', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
    invoiceexcursionsupplier: { icon: '🏖️', desc: 'Invoice Excursion Supplier', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
    invoicetransportationsupplier: { icon: '🚗', desc: 'Invoice Transportation Supplier', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
    guideallowance: { icon: '👤', desc: 'Guide Allowance', gradient: 'linear-gradient(135deg, #d4fc79, #96e6a1)' },
    repcommission: { icon: '👨‍💼', desc: 'Rep Commission', gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)' },
    voucherdataquery: { icon: '🎫', desc: 'Voucher Data Query', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)' },
    search: { icon: '🔍', desc: 'Search', gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)' }
  };

  constructor(
    private reportService: ReportService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.reportService.getOperationReports().subscribe({
      next: (data) => {
        this.reports = this.mapReports(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading operation reports', err);
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
        'codesreports': 'codes-reports',
        'invoiceagent': 'invoice-agent',
        'invoiceboatsupplier': 'invoice-boat-supplier',
        'invoiceexcursionsupplier': 'invoice-excursion-supplier',
        'invoicetransportationsupplier': 'invoice-transportation-supplier',
        'guideallowance': 'guide-allowance',
        'repcommission': 'rep-commission',
        'voucherdataquery': 'voucher-data-query'
      };
      if (folderMap[def.key]) {
        folderName = folderMap[def.key];
      }

      return {
        key: def.key,
        label: def.displayName,
        route: `/operation/reports/${folderName}`,
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
