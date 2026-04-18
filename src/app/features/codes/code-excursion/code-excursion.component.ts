import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Excursion, ExcursionSupplier } from '../../../core/interfaces/code.interfaces';
import { LookupMap } from '../../../shared/services/export.service';

@Component({ selector: 'app-code-excursion', standalone: false, templateUrl: './code-excursion.component.html', styleUrl: './code-excursion.component.scss' })
export class CodeExcursionComponent implements OnInit {
  items: Excursion[] = []; model: Excursion = { excursionName: '', isActive: false }; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  suppliers: ExcursionSupplier[] = [];
  showDeleteConfirm = false; deleteTarget: Excursion | null = null;
  private authService = inject(AuthService);
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); this.svc.getExcursionSuppliers().subscribe(d => { this.suppliers = d; this.cdr.detectChanges(); }); }
  loadData(): void { this.svc.getExcursions().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): Excursion[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.excursionName || '').toLowerCase().includes(t) || (i.supplierName || '').toLowerCase().includes(t)); }
  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }
  get lookups(): LookupMap {
    return {
      supplierId: this.suppliers.filter(s => s.id != null).map(s => ({ id: s.id!, name: s.supplierName }))
    };
  }
  getSupplierName(id?: number): string {
    if (id == null) return '';
    return this.suppliers.find(s => s.id === id)?.supplierName || '';
  }
  openAdd(): void { this.model = { excursionName: '', isActive: false }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Excursion): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    if (!this.model.excursionName) { alert('⚠️ Required'); return; }
    this.saving = true;
    this.model.recordBy = this.authService.currentUser()?.userName || '';
    if (this.isEdit && this.model.id) {
      this.svc.updateExcursion(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createExcursion(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Excursion): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteExcursion(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/operation/codes']); }
}
