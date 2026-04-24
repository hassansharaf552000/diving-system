import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../core/services/code.service';
import { AccountingService } from '../../core/services/accounting.service';

interface StatCard {
  label: string;
  value: number | string;
  gradient: string;
  icon?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentModule: 'operation' | 'accounting' = 'operation';
  operationStats: StatCard[] = [
    { label: 'Total Transactions', value: 0, gradient: 'linear-gradient(135deg, #15803d 0%, #4ade80 100%)', icon: 'fas fa-file-invoice' },
    { label: 'Active Boats', value: 0, gradient: 'linear-gradient(135deg, #16a34a 0%, #86efac 100%)', icon: 'fas fa-ship' },
    { label: 'Total Guides', value: 0, gradient: 'linear-gradient(135deg, #059669 0%, #6ee7b7 100%)', icon: 'fas fa-user-tie' },
    { label: 'Total Hotels', value: 0, gradient: 'linear-gradient(135deg, #0d9488 0%, #5eead4 100%)', icon: 'fas fa-hotel' }
  ];

  accountingStats: StatCard[] = [
    { label: 'Operation Accounts', value: 0, gradient: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)', icon: 'fas fa-landmark' },
    { label: 'Treasury Transactions', value: 0, gradient: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)', icon: 'fas fa-money-check-alt' },
    { label: 'Treasury Counters', value: 0, gradient: 'linear-gradient(135deg, #0d47a1 0%, #2196f3 100%)', icon: 'fas fa-cash-register' }
  ];

  constructor(
    private codeService: CodeService,
    private accountingService: AccountingService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentModule = this.router.url.includes('/accounting') ? 'accounting' : 'operation';
    if (this.currentModule === 'operation') {
      this.loadOperationStats();
    } else {
      this.loadAccountingStats();
    }
  }

  private extractArray(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.$values)) return res.$values;
    if (Array.isArray(res.items)) return res.items;
    return [];
  }

  loadOperationStats() {
    this.codeService.getEntryTransactions().subscribe({
      next: (res) => {
        const arr = this.extractArray(res);
        this.operationStats[0].value = arr.length;
        this.operationStats = [...this.operationStats];
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Dashboard EntryTransactions error', e)
    });

    this.codeService.getBoats().subscribe({
      next: (res) => {
        const arr = this.extractArray(res);
        this.operationStats[1].value = arr.filter(b => b.isActive !== false).length;
        this.operationStats = [...this.operationStats];
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Dashboard Boats error', e)
    });

    this.codeService.getGuides().subscribe({
      next: (res) => {
        const arr = this.extractArray(res);
        this.operationStats[2].value = arr.filter(g => g.isActive !== false).length;
        this.operationStats = [...this.operationStats];
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Dashboard Guides error', e)
    });

    this.codeService.getHotels().subscribe({
      next: (res) => {
        const arr = this.extractArray(res);
        this.operationStats[3].value = arr.filter(h => h.isActive !== false).length;
        this.operationStats = [...this.operationStats];
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Dashboard Hotels error', e)
    });
  }

  loadAccountingStats() {
    this.accountingService.getAllAccountsFlat().subscribe({
      next: (res) => {
        const arr = this.extractArray(res);
        this.accountingStats[0].value = arr.length;
        this.accountingStats = [...this.accountingStats];
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Dashboard Accounts error', e)
    });

    this.accountingService.searchTreasuryTransactions().subscribe({
      next: (res) => {
        const arr = this.extractArray(res);
        this.accountingStats[1].value = arr.length;
        this.accountingStats = [...this.accountingStats];
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Dashboard TreasuryTransactions error', e)
    });

    this.accountingService.searchTreasuryCounters().subscribe({
      next: (res) => {
        const arr = this.extractArray(res);
        this.accountingStats[2].value = arr.length;
        this.accountingStats = [...this.accountingStats];
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Dashboard TreasuryCounters error', e)
    });
  }
}
