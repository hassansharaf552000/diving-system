import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService } from '../../../../core/services/accounting.service';
import {
  TreasuryCounter,
  TreasuryCounterLine,
  TreasuryCounterCreate
} from '../../../../core/interfaces/code.interfaces';

interface DenominationRow {
  denomination: number;
  count: number;
  total: number;
}

@Component({
  selector: 'app-accounting-entry-counter',
  standalone: false,
  templateUrl: './accounting-entry-counter.component.html',
  styleUrl: './accounting-entry-counter.component.scss'
})
export class AccountingEntryCounterComponent implements OnInit {

  currencies: string[] = ['EGP', 'USD', 'EUR', 'GBP'];

  // Default denominations for each currency
  defaultDenominations: { [key: string]: number[] } = {
    EGP: [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25],
    USD: [100, 50, 20, 10, 5, 2, 1, 0.5, 0.25],
    EUR: [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1],
    GBP: [50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1]
  };

  // Search filters
  searchCurrency = '';
  searchBranch = '';
  searchFromDate = '';
  searchToDate = '';

  // Data
  counters: TreasuryCounter[] = [];
  selectedCounter: TreasuryCounter | null = null;

  // Modal state
  isModalOpen = false;
  saving = false;

  // Form fields
  counterDate = '';
  branchName = '';
  currency = 'EGP';
  recordBy = '';
  denominationRows: DenominationRow[] = [];

  // Delete dialog
  showDeleteConfirm = false;
  deleteTarget: TreasuryCounter | null = null;

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchCounters();
  }

  // ============ SEARCH ============
  searchCounters(): void {
    this.svc.searchTreasuryCounters(
      this.searchCurrency || undefined,
      this.searchBranch || undefined,
      this.searchFromDate || undefined,
      this.searchToDate || undefined
    ).subscribe({
      next: (data) => {
        this.counters = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error searching counters:', err)
    });
  }

  // ============ SELECT ============
  selectCounter(c: TreasuryCounter): void {
    if (c.treasuryCounterId) {
      this.svc.getTreasuryCounter(c.treasuryCounterId).subscribe({
        next: (full) => {
          this.selectedCounter = full;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading counter:', err)
      });
    }
  }

  // ============ ADD NEW ============
  openAdd(): void {
    this.counterDate = new Date().toISOString().split('T')[0];
    this.branchName = '';
    this.currency = 'EGP';
    this.recordBy = '';
    this.treasuryBalance = 0;
    this.initDenominations('EGP');
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saving = false;
  }

  onCurrencyChange(): void {
    this.initDenominations(this.currency);
  }

  initDenominations(curr: string): void {
    const denoms = this.defaultDenominations[curr] || this.defaultDenominations['EGP'];
    this.denominationRows = denoms.map(d => ({
      denomination: d,
      count: 0,
      total: 0
    }));
  }

  updateRowTotal(row: DenominationRow): void {
    row.total = row.denomination * row.count;
  }

  get totalCounter(): number {
    return this.denominationRows.reduce((sum, r) => sum + (r.total || 0), 0);
  }

  treasuryBalance: number = 0;

  get difference(): number {
    return this.totalCounter - (this.treasuryBalance || 0);
  }

  // ============ SAVE ============
  save(): void {
    if (!this.counterDate) {
      alert('⚠️ Please select a Date');
      return;
    }

    const linesWithCount = this.denominationRows.filter(r => r.count > 0);
    if (linesWithCount.length === 0) {
      alert('⚠️ Please enter count for at least one denomination');
      return;
    }

    this.saving = true;
    const payload: TreasuryCounterCreate & { treasuryBalance?: number } = {
      counterDate: this.counterDate,
      branchName: this.branchName || undefined,
      currency: this.currency,
      lines: linesWithCount.map(r => ({
        denomination: r.denomination,
        count: r.count
      })),
      recordBy: this.recordBy || undefined,
      treasuryBalance: this.treasuryBalance
    };

    this.svc.createTreasuryCounter(payload).subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.cdr.detectChanges();
        this.searchCounters();
      },
      error: (err) => {
        this.saving = false;
        console.error('Create error:', err);
        alert('Failed to create: ' + (err.error?.message || err.message));
      }
    });
  }

  // ============ DELETE ============
  confirmDelete(c: TreasuryCounter): void {
    this.deleteTarget = c;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.treasuryCounterId) {
      this.svc.deleteTreasuryCounter(this.deleteTarget.treasuryCounterId).subscribe({
        next: () => {
          if (this.selectedCounter?.treasuryCounterId === this.deleteTarget?.treasuryCounterId) {
            this.selectedCounter = null;
          }
          this.searchCounters();
        },
        error: (err) => { console.error('Delete error:', err); alert('Failed to delete'); }
      });
    }
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  // ============ NAVIGATION ============
  goBack(): void {
    this.router.navigate(['/accounting/entries']);
  }
}