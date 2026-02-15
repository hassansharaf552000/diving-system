import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { TransportationType, TransportationSupplier } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-transportation-type', standalone: false, templateUrl: './code-transportation-type.component.html', styleUrl: './code-transportation-type.component.scss' })
export class CodeTransportationTypeComponent implements OnInit {
  items: TransportationType[] = []; model: TransportationType = { typeName: '' }; isModalOpen = false; isEdit = false; searchTerm = '';
  suppliers: TransportationSupplier[] = [];
  showDeleteConfirm = false; deleteTarget: TransportationType | null = null;
  constructor(private svc: CodeService, private router: Router) { }
  ngOnInit(): void { this.loadData(); this.svc.getTransportationSuppliers().subscribe(d => this.suppliers = d); }
  loadData(): void { this.svc.getTransportationTypes().subscribe(d => this.items = d); }
  get filtered(): TransportationType[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.typeName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { typeName: '' }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: TransportationType): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    if (!this.model.typeName) { alert('⚠️ Required'); return; }
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateTransportationType(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createTransportationType(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: TransportationType): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteTransportationType(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
