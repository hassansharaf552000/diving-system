import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { TransportationCost, TransportationType } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-transportation-cost', standalone: false, templateUrl: './code-transportation-cost.component.html', styleUrl: './code-transportation-cost.component.scss' })
export class CodeTransportationCostComponent implements OnInit {
  items: TransportationCost[] = []; model: TransportationCost = {}; isModalOpen = false; isEdit = false; searchTerm = '';
  types: TransportationType[] = [];
  showDeleteConfirm = false; deleteTarget: TransportationCost | null = null;
  constructor(private svc: CodeService, private router: Router) { }
  ngOnInit(): void { this.loadData(); this.svc.getTransportationTypes().subscribe(d => this.types = d); }
  loadData(): void { this.svc.getTransportationCosts().subscribe(d => this.items = d); }
  get filtered(): TransportationCost[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.typeName || '').toLowerCase().includes(t) || (i.currency || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = {}; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: TransportationCost): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateTransportationCost(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createTransportationCost(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: TransportationCost): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteTransportationCost(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
