import Swal from 'sweetalert2';
﻿import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService } from '../../../../core/services/accounting.service';
import { CodeBeneficiaryName, CodeBeneficiaryType } from '../../../../core/interfaces/code.interfaces';
import { LookupMap } from '../../../../shared/services/export.service';

@Component({
  selector: 'app-accounting-code-beneficiary-name',
  standalone: false,
  templateUrl: './accounting-code-beneficiary-name.component.html',
  styleUrl: './accounting-code-beneficiary-name.component.scss'
})
export class AccountingCodeBeneficiaryNameComponent implements OnInit {
  items: CodeBeneficiaryName[] = [];
  beneficiaryTypes: CodeBeneficiaryType[] = [];
  saving = false;
  model: CodeBeneficiaryName = { beneficiaryName: '', active: true };
  isModalOpen = false;
  isEdit = false;
  searchTerm = '';
  showDeleteConfirm = false;
  deleteTarget: CodeBeneficiaryName | null = null;

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadTypes();
  }

  loadTypes(): void {
    this.svc.getCodeBeneficiaryTypes().subscribe({
      next: (types) => { this.beneficiaryTypes = types; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading beneficiary types:', err)
    });
  }

  loadData(): void {
    this.svc.getCodeBeneficiaryNames().subscribe({
      next: (data) => { this.items = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading beneficiary names:', err)
    });
  }

  get filtered(): CodeBeneficiaryName[] {
    if (!this.searchTerm) return this.items;
    const t = this.searchTerm.toLowerCase();
    return this.items.filter(i =>
      (i.beneficiaryName || '').toLowerCase().includes(t) ||
      (i.beneficiaryTypeName || '').toLowerCase().includes(t) ||
      (i.commercialName || '').toLowerCase().includes(t) ||
      (i.phone || '').toLowerCase().includes(t)
    );
  }
  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }

  get lookups(): LookupMap {
    return {
      beneficiaryTypeId: this.beneficiaryTypes
        .filter(t => t.beneficiaryTypeId != null)
        .map(t => ({ id: t.beneficiaryTypeId!, name: t.beneficiaryTypeName }))
    };
  }

  openAdd(): void {
    this.model = { beneficiaryName: '', active: true };
    this.isEdit = false;
    this.isModalOpen = true;
  }

  openEdit(item: CodeBeneficiaryName): void {
    this.model = { ...item };
    this.isEdit = true;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saving = false;
  }

  save(): void {
    if (!this.model.beneficiaryName) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Please fill in Beneficiary Name');
      return;
    }
    this.saving = true;
    if (this.isEdit && this.model.beneficiaryId) {
      this.svc.updateCodeBeneficiaryName(this.model.beneficiaryId, this.model).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadData(); this.cdr.detectChanges(); },
        error: (err) => { this.saving = false; console.error('Update error:', err); Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to update'); }
      });
    } else {
      this.svc.createCodeBeneficiaryName(this.model).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadData(); this.cdr.detectChanges(); },
        error: (err) => { this.saving = false; console.error('Create error:', err); Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to create'); }
      });
    }
  }

  confirmDelete(item: CodeBeneficiaryName): void {
    this.deleteTarget = item;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.beneficiaryId) {
      this.svc.deleteCodeBeneficiaryName(this.deleteTarget.beneficiaryId).subscribe({
        next: () => this.loadData(),
        error: (err) => { console.error('Delete error:', err); Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to delete'); }
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
