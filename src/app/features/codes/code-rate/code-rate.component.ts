import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Rate } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-rate', standalone: false, templateUrl: './code-rate.component.html', styleUrl: './code-rate.component.scss' })
export class CodeRateComponent implements OnInit {
  items: Rate[] = []; model: Rate = {}; isModalOpen = false; isEdit = false; searchTerm = '';
  showDeleteConfirm = false; deleteTarget: Rate | null = null;
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getRates().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): Rate[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.currency || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = {}; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Rate): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateRate(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createRate(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Rate): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteRate(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
