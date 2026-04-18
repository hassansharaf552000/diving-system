import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { TransportationSupplier } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-transportation-supplier', standalone: false, templateUrl: './code-transportation-supplier.component.html', styleUrl: './code-transportation-supplier.component.scss' })
export class CodeTransportationSupplierComponent implements OnInit {
  items: TransportationSupplier[] = []; model: TransportationSupplier = { supplierName: '', vatNo: '', fileNo: '', email: '', address: '', phone: '', isActive: false }; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  showDeleteConfirm = false; deleteTarget: TransportationSupplier | null = null;
  private authService = inject(AuthService);
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getTransportationSuppliers().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): TransportationSupplier[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.supplierName || '').toLowerCase().includes(t)); }
  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }
  openAdd(): void { this.model = { supplierName: '', vatNo: '', fileNo: '', email: '', address: '', phone: '', isActive: false }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: TransportationSupplier): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    if (!this.model.supplierName) { Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Required'); return; }
    this.saving = true;
    this.model.recordBy = this.authService.currentUser()?.userName || '';
    if (this.isEdit && this.model.id) {
      this.svc.updateTransportationSupplier(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createTransportationSupplier(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: TransportationSupplier): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteTransportationSupplier(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/operation/codes']); }
}
