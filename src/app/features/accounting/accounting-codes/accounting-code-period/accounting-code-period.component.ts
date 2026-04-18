import Swal from 'sweetalert2';
﻿import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService } from '../../../../core/services/accounting.service';
import { CodePeriod } from '../../../../core/interfaces/code.interfaces';

@Component({
  selector: 'app-accounting-code-period',
  standalone: false,
  templateUrl: './accounting-code-period.component.html',
  styleUrl: './accounting-code-period.component.scss'
})
export class AccountingCodePeriodComponent implements OnInit {
  items: CodePeriod[] = [];
  saving = false;
  model: CodePeriod = { periodName: '', active: true };
  isModalOpen = false;
  isEdit = false;
  searchTerm = '';
  showDeleteConfirm = false;
  deleteTarget: CodePeriod | null = null;

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.svc.getCodePeriods().subscribe({
      next: (data) => { this.items = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading periods:', err)
    });
  }

  get filtered(): CodePeriod[] {
    if (!this.searchTerm) return this.items;
    const t = this.searchTerm.toLowerCase();
    return this.items.filter(i =>
      (i.periodName || '').toLowerCase().includes(t) ||
      (i.recordBy || '').toLowerCase().includes(t)
    );
  }
  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }

  openAdd(): void {
    this.model = { periodName: '', active: true };
    this.isEdit = false;
    this.isModalOpen = true;
  }

  openEdit(item: CodePeriod): void {
    this.model = { ...item };
    this.isEdit = true;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saving = false;
  }

  save(): void {
    if (!this.model.periodName) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Please fill in Period Name');
      return;
    }
    this.saving = true;
    if (this.isEdit && this.model.periodId) {
      this.svc.updateCodePeriod(this.model.periodId, this.model).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Update error:', err); Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to update period'); }
      });
    } else {
      this.svc.createCodePeriod(this.model).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Create error:', err); Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to create period'); }
      });
    }
  }

  confirmDelete(item: CodePeriod): void {
    this.deleteTarget = item;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.periodId) {
      this.svc.deleteCodePeriod(this.deleteTarget.periodId).subscribe({
        next: () => this.loadData(),
        error: (err) => { console.error('Delete error:', err); Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to delete period'); }
      });
    }
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  goBack(): void {
    this.router.navigate(['/accounting/codes']);
  }
}
