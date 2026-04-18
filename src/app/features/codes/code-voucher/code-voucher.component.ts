import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Voucher, Rep } from '../../../core/interfaces/code.interfaces';
import { LookupMap } from '../../../shared/services/export.service';

@Component({ selector: 'app-code-voucher', standalone: false, templateUrl: './code-voucher.component.html', styleUrl: './code-voucher.component.scss' })
export class CodeVoucherComponent implements OnInit {
  items: Voucher[] = []; model: Voucher = {}; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  reps: Rep[] = [];
  showDeleteConfirm = false; deleteTarget: Voucher | null = null;
  private authService = inject(AuthService);
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); this.svc.getReps().subscribe(d => { this.reps = d; this.cdr.detectChanges(); }); }
  loadData(): void { this.svc.getVouchers().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): Voucher[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.repName || '').toLowerCase().includes(t) || String(i.fromNumber || '').includes(t)); }
  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }
  get lookups(): LookupMap {
    return {
      repId: this.reps.filter(r => r.id != null).map(r => ({ id: r.id!, name: r.repName }))
    };
  }
  getRepName(id?: number): string {
    if (id == null) return '';
    return this.reps.find(r => r.id === id)?.repName || '';
  }
  openAdd(): void { this.model = {}; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Voucher): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    this.saving = true;
    this.model.recordBy = this.authService.currentUser()?.userName || '';
    if (this.isEdit && this.model.id) {
      this.svc.updateVoucher(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createVoucher(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Voucher): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteVoucher(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/operation/codes']); }
}
