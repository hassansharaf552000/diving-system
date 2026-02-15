import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { HotelDestination } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-hotel-destination', standalone: false, templateUrl: './code-hotel-destination.component.html', styleUrl: './code-hotel-destination.component.scss' })
export class CodeHotelDestinationComponent implements OnInit {
  items: HotelDestination[] = []; model: HotelDestination = { destinationName: '' }; isModalOpen = false; isEdit = false; searchTerm = '';
  showDeleteConfirm = false; deleteTarget: HotelDestination | null = null;
  constructor(private svc: CodeService, private router: Router) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getHotelDestinations().subscribe(d => this.items = d); }
  get filtered(): HotelDestination[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.destinationName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { destinationName: '' }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: HotelDestination): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    if (!this.model.destinationName) { alert('⚠️ Required'); return; }
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateHotelDestination(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createHotelDestination(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: HotelDestination): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteHotelDestination(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
