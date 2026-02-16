import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { TransportationSupplier } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-transportation-supplier', standalone: false, templateUrl: './code-transportation-supplier.component.html', styleUrl: './code-transportation-supplier.component.scss' })
export class CodeTransportationSupplierComponent implements OnInit {
  items: TransportationSupplier[] = []; model: TransportationSupplier = { supplierName: '', vatNo: '', fileNo: '', email: '', address: '', phone: '', isActive: false }; isModalOpen = false; isEdit = false; searchTerm = '';
  showDeleteConfirm = false; deleteTarget: TransportationSupplier | null = null;
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getTransportationSuppliers().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): TransportationSupplier[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.supplierName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { supplierName: '', vatNo: '', fileNo: '', email: '', address: '', phone: '', isActive: false }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: TransportationSupplier): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    if (!this.model.supplierName) { alert('⚠️ Required'); return; }
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateTransportationSupplier(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createTransportationSupplier(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: TransportationSupplier): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteTransportationSupplier(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
