import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService } from '../../../../core/services/accounting.service';
import { CodeFileNumber, CodePeriod, CodeAgent } from '../../../../core/interfaces/code.interfaces';

@Component({
  selector: 'app-accounting-code-file',
  standalone: false,
  templateUrl: './accounting-code-file.component.html',
  styleUrl: './accounting-code-file.component.scss'
})
export class AccountingCodeFileComponent implements OnInit {
  items: CodeFileNumber[] = [];
  agents: CodeAgent[] = [];
  periods: CodePeriod[] = [];
  saving = false;
  model: CodeFileNumber = { fileNumber: '', fileName: '', active: true };
  isModalOpen = false;
  isEdit = false;
  searchTerm = '';
  showDeleteConfirm = false;
  deleteTarget: CodeFileNumber | null = null;

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadLookups();
  }

  loadData(): void {
    this.svc.getCodeFileNumbers().subscribe({
      next: (data) => { this.items = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading file numbers:', err)
    });
  }

  loadLookups(): void {
    this.svc.getCodeAgents().subscribe({
      next: (data) => { this.agents = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading agents:', err)
    });
    this.svc.getCodePeriods().subscribe({
      next: (data) => { this.periods = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading periods:', err)
    });
  }

  get filtered(): CodeFileNumber[] {
    if (!this.searchTerm) return this.items;
    const t = this.searchTerm.toLowerCase();
    return this.items.filter(i =>
      (i.fileNumber || '').toLowerCase().includes(t) ||
      (i.fileName || '').toLowerCase().includes(t) ||
      (i.agentName || '').toLowerCase().includes(t) ||
      (i.periodName || '').toLowerCase().includes(t)
    );
  }

  openAdd(): void {
    this.model = { fileNumber: '', fileName: '', active: true };
    this.isEdit = false;
    this.isModalOpen = true;
  }

  openEdit(item: CodeFileNumber): void {
    this.model = { ...item };
    this.isEdit = true;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saving = false;
  }

  save(): void {
    if (!this.model.fileName) {
      alert('⚠️ Please fill in File Name');
      return;
    }
    this.saving = true;
    if (this.isEdit && this.model.fileId) {
      this.svc.updateCodeFileNumber(this.model.fileId, this.model).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadData(); this.cdr.detectChanges(); },
        error: (err) => { this.saving = false; console.error('Update error:', err); alert('Failed to update'); }
      });
    } else {
      this.svc.createCodeFileNumber(this.model).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadData(); this.cdr.detectChanges(); },
        error: (err) => { this.saving = false; console.error('Create error:', err); alert('Failed to create'); }
      });
    }
  }

  confirmDelete(item: CodeFileNumber): void {
    this.deleteTarget = item;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.fileId) {
      this.svc.deleteCodeFileNumber(this.deleteTarget.fileId).subscribe({
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