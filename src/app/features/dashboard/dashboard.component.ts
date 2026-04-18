import { Component, OnInit } from '@angular/core';
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
  operationStats: StatCard[] = [
    { label: 'Total Transactions', value: 0, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: 'fas fa-file-invoice' },
    { label: 'Active Boats', value: 0, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: 'fas fa-ship' },
    { label: 'Total Guides', value: 0, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: 'fas fa-user-tie' },
    { label: 'Total Hotels', value: 0, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: 'fas fa-hotel' }
  ];

  accountingStats: StatCard[] = [
    { label: 'Operation Accounts', value: 0, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: 'fas fa-landmark' },
    { label: 'Treasury Transactions', value: 0, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: 'fas fa-money-check-alt' },
    { label: 'Treasury Counters', value: 0, gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', icon: 'fas fa-cash-register' }
  ];

  constructor(
    private codeService: CodeService,
    private accountingService: AccountingService
  ) {}

  ngOnInit() {
    this.loadOperationStats();
    this.loadAccountingStats();
  }

  loadOperationStats() {
    this.codeService.getEntryTransactions().subscribe({
      next: (res) => {
        this.operationStats[0].value = res?.length || 0;
      },
      error: () => {}
    });

    this.codeService.getBoats().subscribe({
      next: (res) => {
        this.operationStats[1].value = res?.filter(b => b.isActive).length || 0;
      },
      error: () => {}
    });

    this.codeService.getGuides().subscribe({
      next: (res) => {
        this.operationStats[2].value = res?.filter(g => g.isActive).length || 0;
      },
      error: () => {}
    });

    this.codeService.getHotels().subscribe({
      next: (res) => {
        this.operationStats[3].value = res?.filter(h => h.isActive).length || 0;
      },
      error: () => {}
    });
  }

  loadAccountingStats() {
    this.accountingService.getAllAccountsFlat().subscribe({
      next: (res) => {
        this.accountingStats[0].value = res?.length || 0;
      },
      error: () => {}
    });

    this.accountingService.searchTreasuryTransactions().subscribe({
      next: (res) => {
        this.accountingStats[1].value = res?.length || 0;
      },
      error: () => {}
    });

    this.accountingService.searchTreasuryCounters().subscribe({
      next: (res) => {
        this.accountingStats[2].value = res?.length || 0;
      },
      error: () => {}
    });
  }
}
