import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { ExcursionSupplier } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-excursion-supplier', standalone: false, templateUrl: './code-excursion-supplier.component.html', styleUrl: './code-excursion-supplier.component.scss' })
export class CodeExcursionSupplierComponent implements OnInit {
  items: ExcursionSupplier[] = []; model: ExcursionSupplier = { supplierName: '' }; isModalOpen = false; isEdit = false; searchTerm = '';
  showDeleteConfirm = false; deleteTarget: ExcursionSupplier | null = null;
  constructor(private svc: CodeService, private router: Router) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getExcursionSuppliers().subscribe(d => this.items = d); }
  get filtered(): ExcursionSupplier[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.supplierName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { supplierName: '' }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: ExcursionSupplier): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    if (!this.model.supplierName) { alert('⚠️ Required'); return; }
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateExcursionSupplier(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createExcursionSupplier(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: ExcursionSupplier): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteExcursionSupplier(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
