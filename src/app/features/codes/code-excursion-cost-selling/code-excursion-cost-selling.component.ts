import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { ExcursionCostSelling, Excursion, HotelDestination, Agent, ExcursionSupplier, PriceList } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-excursion-cost-selling', standalone: false, templateUrl: './code-excursion-cost-selling.component.html', styleUrl: './code-excursion-cost-selling.component.scss' })
export class CodeExcursionCostSellingComponent implements OnInit {
  items: ExcursionCostSelling[] = []; model: ExcursionCostSelling = {}; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  excursions: Excursion[] = [];
  destinations: HotelDestination[] = [];
  agents: Agent[] = [];
  suppliers: ExcursionSupplier[] = [];
  priceLists: PriceList[] = [];
  showDeleteConfirm = false; deleteTarget: ExcursionCostSelling | null = null;
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.loadData();
    this.svc.getExcursions().subscribe(d => { this.excursions = d; this.cdr.detectChanges(); });
    this.svc.getHotelDestinations().subscribe(d => { this.destinations = d; this.cdr.detectChanges(); });
    this.svc.getAgents().subscribe(d => { this.agents = d; this.cdr.detectChanges(); });
    this.svc.getExcursionSuppliers().subscribe(d => { this.suppliers = d; this.cdr.detectChanges(); });
    this.svc.getPriceLists().subscribe(d => { this.priceLists = d; this.cdr.detectChanges(); });
  }
  loadData(): void { this.svc.getExcursionCostSellings().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): ExcursionCostSelling[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.excursionName || '').toLowerCase().includes(t) || (i.agentName || '').toLowerCase().includes(t) || (i.destinationName || '').toLowerCase().includes(t) || (i.supplierName || '').toLowerCase().includes(t) || (i.priceListName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = {}; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: ExcursionCostSelling): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    this.saving = true;
    this.model.recordBy = 'Ibram Wahib';
    this.closeModal();
    if (this.isEdit && this.model.id) {
      this.svc.updateExcursionCostSelling(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); });
    } else {
      this.svc.createExcursionCostSelling(this.model).subscribe(() => { this.saving = false; this.loadData(); });
    }
  }
  confirmDelete(item: ExcursionCostSelling): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteExcursionCostSelling(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
