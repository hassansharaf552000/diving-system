import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
      alert('⚠️ Please fill in Period Name');
      return;
    }
    this.saving = true;
    if (this.isEdit && this.model.periodId) {
      this.svc.updateCodePeriod(this.model.periodId, this.model).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Update error:', err); alert('Failed to update period'); }
      });
    } else {
      this.svc.createCodePeriod(this.model).subscribe({
        next: () => { this.saving = false; this.loadData(); this.closeModal(); },
        error: (err) => { this.saving = false; console.error('Create error:', err); alert('Failed to create period'); }
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
        error: (err) => { console.error('Delete error:', err); alert('Failed to delete period'); }
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