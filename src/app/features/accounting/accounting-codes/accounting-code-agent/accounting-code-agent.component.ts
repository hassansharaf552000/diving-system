import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService } from '../../../../core/services/accounting.service';
import { CodeAgent } from '../../../../core/interfaces/code.interfaces';

@Component({
  selector: 'app-accounting-code-agent',
  standalone: false,
  templateUrl: './accounting-code-agent.component.html',
  styleUrl: './accounting-code-agent.component.scss'
})
export class AccountingCodeAgentComponent implements OnInit {
  items: CodeAgent[] = [];
  saving = false;
  model: CodeAgent = { agentName: '', active: true };
  isModalOpen = false;
  isEdit = false;
  searchTerm = '';
  showDeleteConfirm = false;
  deleteTarget: CodeAgent | null = null;

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.svc.getCodeAgents().subscribe({
      next: (data) => { this.items = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading agents:', err)
    });
  }

  get filtered(): CodeAgent[] {
    if (!this.searchTerm) return this.items;
    const t = this.searchTerm.toLowerCase();
    return this.items.filter(i =>
      (i.agentName || '').toLowerCase().includes(t) ||
      (i.recordBy || '').toLowerCase().includes(t)
    );
  }

  openAdd(): void {
    this.model = { agentName: '', active: true };
    this.isEdit = false;
    this.isModalOpen = true;
  }

  openEdit(item: CodeAgent): void {
    this.model = { ...item };
    this.isEdit = true;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saving = false;
  }

  save(): void {
    if (!this.model.agentName) {
      alert('⚠️ Please fill in Agent Name');
      return;
    }
    this.saving = true;
    if (this.isEdit && this.model.agentId) {
      this.svc.updateCodeAgent(this.model.agentId, this.model).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadData(); this.cdr.detectChanges(); },
        error: (err) => { this.saving = false; console.error('Update error:', err); alert('Failed to update'); }
      });
    } else {
      this.svc.createCodeAgent(this.model).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadData(); this.cdr.detectChanges(); },
        error: (err) => { this.saving = false; console.error('Create error:', err); alert('Failed to create'); }
      });
    }
  }

  confirmDelete(item: CodeAgent): void {
    this.deleteTarget = item;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.agentId) {
      this.svc.deleteCodeAgent(this.deleteTarget.agentId).subscribe({
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