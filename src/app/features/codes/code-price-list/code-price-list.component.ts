import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { PriceList } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-price-list', standalone: false, templateUrl: './code-price-list.component.html', styleUrl: './code-price-list.component.scss' })
export class CodePriceListComponent implements OnInit {
  items: PriceList[] = []; model: PriceList = { priceListName: '' }; isModalOpen = false; isEdit = false; searchTerm = '';
  showDeleteConfirm = false; deleteTarget: PriceList | null = null;
  constructor(private svc: CodeService, private router: Router) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getPriceLists().subscribe(d => this.items = d); }
  get filtered(): PriceList[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.priceListName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { priceListName: '' }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: PriceList): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    if (!this.model.priceListName) { alert('⚠️ Required'); return; }
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updatePriceList(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createPriceList(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: PriceList): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deletePriceList(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
