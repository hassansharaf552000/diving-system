import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Boat } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-boat', standalone: false, templateUrl: './code-boat.component.html', styleUrl: './code-boat.component.scss' })
export class CodeBoatComponent implements OnInit {
  items: Boat[] = []; model: Boat = { boatName: '', isActive: true }; isModalOpen = false; isEdit = false; searchTerm = '';
  showDeleteConfirm = false; deleteTarget: Boat | null = null;
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getBoats().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): Boat[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.boatName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { boatName: '', isActive: true }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Boat): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    if (!this.model.boatName) { alert('⚠️ Boat Name is required'); return; }
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateBoat(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createBoat(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Boat): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteBoat(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
