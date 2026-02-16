import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Voucher, Rep } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-voucher', standalone: false, templateUrl: './code-voucher.component.html', styleUrl: './code-voucher.component.scss' })
export class CodeVoucherComponent implements OnInit {
  items: Voucher[] = []; model: Voucher = {}; isModalOpen = false; isEdit = false; searchTerm = '';
  reps: Rep[] = [];
  showDeleteConfirm = false; deleteTarget: Voucher | null = null;
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); this.svc.getReps().subscribe(d => { this.reps = d; this.cdr.detectChanges(); }); }
  loadData(): void { this.svc.getVouchers().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): Voucher[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.repName || '').toLowerCase().includes(t) || String(i.fromNumber || '').includes(t)); }
  openAdd(): void { this.model = {}; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Voucher): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateVoucher(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createVoucher(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Voucher): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteVoucher(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
