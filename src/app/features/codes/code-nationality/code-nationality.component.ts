import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Nationality } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-nationality', standalone: false, templateUrl: './code-nationality.component.html', styleUrl: './code-nationality.component.scss' })
export class CodeNationalityComponent implements OnInit {
  items: Nationality[] = []; model: Nationality = { nationalityName: '', isActive: false }; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  showDeleteConfirm = false; deleteTarget: Nationality | null = null;
  private authService = inject(AuthService);
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getNationalities().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): Nationality[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.nationalityName || '').toLowerCase().includes(t)); }
  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }
  openAdd(): void { this.model = { nationalityName: '', isActive: false }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Nationality): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    if (!this.model.nationalityName) { Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Required'); return; }
    this.saving = true;
    this.model.recordBy = this.authService.currentUser()?.userName || '';
    if (this.isEdit && this.model.id) {
      this.svc.updateNationality(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createNationality(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Nationality): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteNationality(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/operation/codes']); }
}
