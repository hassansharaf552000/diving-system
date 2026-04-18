import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Rep, Agent } from '../../../core/interfaces/code.interfaces';
import { LookupMap } from '../../../shared/services/export.service';

@Component({ selector: 'app-code-rep', standalone: false, templateUrl: './code-rep.component.html', styleUrl: './code-rep.component.scss' })
export class CodeRepComponent implements OnInit {
  items: Rep[] = []; model: Rep = { repName: '', address: '', phone: '', isActive: false }; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  agents: Agent[] = [];
  showDeleteConfirm = false; deleteTarget: Rep | null = null;
  private authService = inject(AuthService);
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); this.svc.getAgents().subscribe(d => { this.agents = d; this.cdr.detectChanges(); }); }
  loadData(): void { this.svc.getReps().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): Rep[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.repName || '').toLowerCase().includes(t) || (i.agentName || '').toLowerCase().includes(t)); }
  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }
  get lookups(): LookupMap {
    return {
      agentId: this.agents.filter(a => a.id != null).map(a => ({ id: a.id!, name: a.agentName }))
    };
  }
  getAgentName(id?: number): string {
    if (id == null) return '';
    return this.agents.find(a => a.id === id)?.agentName || '';
  }
  openAdd(): void { this.model = { repName: '', address: '', phone: '', isActive: false }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Rep): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    if (!this.model.repName) { alert('⚠️ Required'); return; }
    this.saving = true;
    this.model.recordBy = this.authService.currentUser()?.userName || '';
    if (this.isEdit && this.model.id) {
      this.svc.updateRep(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createRep(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Rep): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteRep(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/operation/codes']); }
}
