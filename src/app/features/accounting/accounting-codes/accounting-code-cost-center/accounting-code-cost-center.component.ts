import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService } from '../../../../core/services/accounting.service';
import { CodeCostCenter } from '../../../../core/interfaces/code.interfaces';

@Component({
  selector: 'app-accounting-code-cost-center',
  standalone: false,
  templateUrl: './accounting-code-cost-center.component.html',
  styleUrl: './accounting-code-cost-center.component.scss'
})
export class AccountingCodeCostCenterComponent implements OnInit {
  items: CodeCostCenter[] = [];
  saving = false;
  model: CodeCostCenter = { costCenterNumber: '', costCenterName: '', costCenterGroup: '', active: true };
  isModalOpen = false;
  isEdit = false;
  searchTerm = '';
  showDeleteConfirm = false;
  deleteTarget: CodeCostCenter | null = null;

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.svc.getCodeCostCenters().subscribe({
      next: (data) => { this.items = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading cost centers:', err)
    });
  }

  get filtered(): CodeCostCenter[] {
    if (!this.searchTerm) return this.items;
    const t = this.searchTerm.toLowerCase();
    return this.items.filter(i =>
      (i.costCenterNumber || '').toLowerCase().includes(t) ||
      (i.costCenterName || '').toLowerCase().includes(t) ||
      (i.costCenterGroup || '').toLowerCase().includes(t)
    );
  }
  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }

  openAdd(): void {
    this.model = { costCenterNumber: '', costCenterName: '', costCenterGroup: '', active: true };
    this.isEdit = false;
    this.isModalOpen = true;
  }

  openEdit(item: CodeCostCenter): void {
    this.model = { ...item };
    this.isEdit = true;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saving = false;
  }

  save(): void {
    if (!this.model.costCenterName) {
      alert('⚠️ Please fill in Cost Center Name');
      return;
    }
    
    this.saving = true;
    const isEditing = this.isEdit && this.model.costCenterId;
    const modelId = this.model.costCenterId;
    const modelData = { ...this.model };

    // Close modal immediately
    this.closeModal();

    if (isEditing && modelId) {
      this.svc.updateCodeCostCenter(modelId, modelData).subscribe({
        next: () => { this.loadData(); this.cdr.detectChanges(); },
        error: (err) => { console.error('Update error:', err); alert('Failed to update'); }
      });
    } else {
      this.svc.createCodeCostCenter(modelData).subscribe({
        next: () => { this.loadData(); this.cdr.detectChanges(); },
        error: (err) => { console.error('Create error:', err); alert('Failed to create'); }
      });
    }
  }

  confirmDelete(item: CodeCostCenter): void {
    this.deleteTarget = item;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.costCenterId) {
      this.svc.deleteCodeCostCenter(this.deleteTarget.costCenterId).subscribe({
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
