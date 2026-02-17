import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Hotel, HotelDestination } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-hotel', standalone: false, templateUrl: './code-hotel.component.html', styleUrl: './code-hotel.component.scss' })
export class CodeHotelComponent implements OnInit {
  items: Hotel[] = []; model: Hotel = { hotelName: '', isActive: false }; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  destinations: HotelDestination[] = [];
  showDeleteConfirm = false; deleteTarget: Hotel | null = null;
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); this.svc.getHotelDestinations().subscribe(d => { this.destinations = d; this.cdr.detectChanges(); }); }
  loadData(): void { this.svc.getHotels().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): Hotel[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.hotelName || '').toLowerCase().includes(t) || (i.destinationName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { hotelName: '', isActive: false }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Hotel): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    if (!this.model.hotelName) { alert('⚠️ Required'); return; }
    this.saving = true;
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateHotel(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createHotel(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Hotel): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteHotel(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
