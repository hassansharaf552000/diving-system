import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Boat } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-boat', standalone: false, templateUrl: './code-boat.component.html', styleUrl: './code-boat.component.scss' })
export class CodeBoatComponent implements OnInit {
  items: Boat[] = []; model: Boat = { boatName: '', isActive: true }; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  showDeleteConfirm = false; deleteTarget: Boat | null = null;
  private authService = inject(AuthService);
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getBoats().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): Boat[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.boatName || '').toLowerCase().includes(t)); }
  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }
  openAdd(): void { this.model = { boatName: '', isActive: true }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Boat): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    if (!this.model.boatName) { Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Boat Name is required'); return; }
    this.saving = true;
    this.model.recordBy = this.authService.currentUser()?.userName || '';
    if (this.isEdit && this.model.id) {
      this.svc.updateBoat(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createBoat(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Boat): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteBoat(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/operation/codes']); }
}
