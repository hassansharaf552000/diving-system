import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Excursion, ExcursionSupplier } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-excursion', standalone: false, templateUrl: './code-excursion.component.html', styleUrl: './code-excursion.component.scss' })
export class CodeExcursionComponent implements OnInit {
  items: Excursion[] = []; model: Excursion = { excursionName: '' }; isModalOpen = false; isEdit = false; searchTerm = '';
  suppliers: ExcursionSupplier[] = [];
  showDeleteConfirm = false; deleteTarget: Excursion | null = null;
  constructor(private svc: CodeService, private router: Router) { }
  ngOnInit(): void { this.loadData(); this.svc.getExcursionSuppliers().subscribe(d => this.suppliers = d); }
  loadData(): void { this.svc.getExcursions().subscribe(d => this.items = d); }
  get filtered(): Excursion[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.excursionName || '').toLowerCase().includes(t) || (i.supplierName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { excursionName: '' }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Excursion): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    if (!this.model.excursionName) { alert('⚠️ Required'); return; }
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateExcursion(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createExcursion(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Excursion): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteExcursion(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
