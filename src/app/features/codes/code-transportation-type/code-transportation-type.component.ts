import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { TransportationType, TransportationSupplier } from '../../../core/interfaces/code.interfaces';
import { LookupMap } from '../../../shared/services/export.service';

@Component({ selector: 'app-code-transportation-type', standalone: false, templateUrl: './code-transportation-type.component.html', styleUrl: './code-transportation-type.component.scss' })
export class CodeTransportationTypeComponent implements OnInit {
  items: TransportationType[] = []; model: TransportationType = { typeName: '', isActive: false }; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  suppliers: TransportationSupplier[] = [];
  showDeleteConfirm = false; deleteTarget: TransportationType | null = null;
  private authService = inject(AuthService);
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); this.svc.getTransportationSuppliers().subscribe(d => { this.suppliers = d; this.cdr.detectChanges(); }); }
  loadData(): void { this.svc.getTransportationTypes().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): TransportationType[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.typeName || '').toLowerCase().includes(t)); }
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
  openAdd(): void { this.model = { typeName: '', isActive: false }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: TransportationType): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    if (!this.model.typeName) { alert('⚠️ Required'); return; }
    this.saving = true;
    this.model.recordBy = this.authService.currentUser()?.userName || '';
    if (this.isEdit && this.model.id) {
      this.svc.updateTransportationType(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createTransportationType(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: TransportationType): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteTransportationType(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/operation/codes']); }
}
