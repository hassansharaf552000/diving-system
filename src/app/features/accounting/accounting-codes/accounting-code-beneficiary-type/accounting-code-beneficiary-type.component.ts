import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService } from '../../../../core/services/accounting.service';
import { CodeBeneficiaryType } from '../../../../core/interfaces/code.interfaces';

@Component({
  selector: 'app-accounting-code-beneficiary-type',
  standalone: false,
  templateUrl: './accounting-code-beneficiary-type.component.html',
  styleUrl: './accounting-code-beneficiary-type.component.scss'
})
export class AccountingCodeBeneficiaryTypeComponent implements OnInit {
  items: CodeBeneficiaryType[] = [];
  saving = false;
  model: CodeBeneficiaryType = { beneficiaryTypeName: '', active: true };
  isModalOpen = false;
  isEdit = false;
  searchTerm = '';
  showDeleteConfirm = false;
  deleteTarget: CodeBeneficiaryType | null = null;

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.svc.getCodeBeneficiaryTypes().subscribe({
      next: (data) => { this.items = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading beneficiary types:', err)
    });
  }

  get filtered(): CodeBeneficiaryType[] {
    if (!this.searchTerm) return this.items;
    const t = this.searchTerm.toLowerCase();
    return this.items.filter(i =>
      (i.beneficiaryTypeName || '').toLowerCase().includes(t) ||
      (i.recordBy || '').toLowerCase().includes(t)
    );
  }

  openAdd(): void {
    this.model = { beneficiaryTypeName: '', active: true };
    this.isEdit = false;
    this.isModalOpen = true;
  }

  openEdit(item: CodeBeneficiaryType): void {
    this.model = { ...item };
    this.isEdit = true;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saving = false;
  }

  save(): void {
    if (!this.model.beneficiaryTypeName) {
      alert('⚠️ Please fill in Beneficiary Type Name');
      return;
    }
    this.saving = true;
    if (this.isEdit && this.model.beneficiaryTypeId) {
      this.svc.updateCodeBeneficiaryType(this.model.beneficiaryTypeId, this.model).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Update error:', err); alert('Failed to update'); }
      });
    } else {
      this.svc.createCodeBeneficiaryType(this.model).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Create error:', err); alert('Failed to create'); }
      });
    }
  }

  confirmDelete(item: CodeBeneficiaryType): void {
    this.deleteTarget = item;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.beneficiaryTypeId) {
      this.svc.deleteCodeBeneficiaryType(this.deleteTarget.beneficiaryTypeId).subscribe({
        next: () => this.loadData(),
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

  goBack(): void {
    this.router.navigate(['/accounting/codes']);
  }
}