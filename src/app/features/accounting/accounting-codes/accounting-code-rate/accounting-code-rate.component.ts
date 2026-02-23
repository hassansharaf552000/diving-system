import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../../core/services/code.service';
import { Rate } from '../../../../core/interfaces/code.interfaces';

@Component({
  selector: 'app-accounting-code-rate',
  standalone: false,
  templateUrl: './accounting-code-rate.component.html',
  styleUrl: './accounting-code-rate.component.scss'
})
export class AccountingCodeRateComponent implements OnInit {
  items: Rate[] = [];
  model: Rate = {};
  isModalOpen = false;
  isEdit = false;
  searchTerm = '';
  saving = false;
  showDeleteConfirm = false;
  deleteTarget: Rate | null = null;

  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.svc.getRates().subscribe({
      next: (d) => { this.items = d; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading rates:', err)
    });
  }

  get filtered(): Rate[] {
    if (!this.searchTerm) return this.items;
    const t = this.searchTerm.toLowerCase();
    return this.items.filter(i => (i.currency || '').toLowerCase().includes(t));
  }

  openAdd(): void { this.model = {}; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Rate): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }

  save(): void {
    this.saving = true;
    if (this.isEdit && this.model.id) {
      this.svc.updateRate(this.model.id, this.model).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadData(); this.cdr.detectChanges(); },
        error: (err) => { this.saving = false; console.error('Update error:', err); alert('Failed to update'); }
      });
    } else {
      this.svc.createRate(this.model).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadData(); this.cdr.detectChanges(); },
        error: (err) => { this.saving = false; console.error('Create error:', err); alert('Failed to create'); }
      });
    }
  }

  confirmDelete(item: Rate): void { this.deleteTarget = item; this.showDeleteConfirm = true; }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.id) {
      this.svc.deleteRate(this.deleteTarget.id).subscribe({
        next: () => this.loadData(),
        error: (err) => { console.error('Delete error:', err); alert('Failed to delete'); }
      });
    }
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }

  goBack(): void { this.router.navigate(['/accounting/codes']); }
}