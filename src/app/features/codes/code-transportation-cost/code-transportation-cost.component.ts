import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { TransportationCost, TransportationType, TransportationSupplier, HotelDestination } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-transportation-cost', standalone: false, templateUrl: './code-transportation-cost.component.html', styleUrl: './code-transportation-cost.component.scss' })
export class CodeTransportationCostComponent implements OnInit {
  items: TransportationCost[] = []; model: TransportationCost = { roundType: 'One Way' }; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  suppliers: TransportationSupplier[] = [];
  carTypes: TransportationType[] = [];
  destinations: HotelDestination[] = [];
  showDeleteConfirm = false; deleteTarget: TransportationCost | null = null;
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { 
    this.loadData(); 
    this.svc.getTransportationSuppliers().subscribe(d => { this.suppliers = d; this.cdr.detectChanges(); });
    this.svc.getTransportationTypes().subscribe(d => { this.carTypes = d; this.cdr.detectChanges(); });
    this.svc.getHotelDestinations().subscribe(d => { this.destinations = d; this.cdr.detectChanges(); });
  }
  loadData(): void { this.svc.getTransportationCosts().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): TransportationCost[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.supplierName || '').toLowerCase().includes(t) || (i.carTypeName || '').toLowerCase().includes(t) || (i.destinationName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { roundType: 'One Way' }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: TransportationCost): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    this.saving = true;
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateTransportationCost(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createTransportationCost(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: TransportationCost): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteTransportationCost(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/operation/codes']); }
}
