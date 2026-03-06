import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Agent, Nationality } from '../../../core/interfaces/code.interfaces';
import { LookupMap } from '../../../shared/services/export.service';

@Component({ selector: 'app-code-agent', standalone: false, templateUrl: './code-agent.component.html', styleUrl: './code-agent.component.scss' })
export class CodeAgentComponent implements OnInit {
  items: Agent[] = [];
  nationalities: Nationality[] = [];
  saving = false;
  model: Agent = { agentName: '' };
  isModalOpen = false;
  isEdit = false;
  searchTerm = '';
  showDeleteConfirm = false;
  deleteTarget: Agent | null = null;

  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { this.loadData(); this.loadNationalities(); }

  loadNationalities(): void {
    this.svc.getNationalities().subscribe(d => { this.nationalities = d; this.cdr.detectChanges(); });
  }

  loadData(): void {
    this.svc.getAgents().subscribe(d => { this.items = d; this.cdr.detectChanges(); });
  }

  get filtered(): Agent[] {
    if (!this.searchTerm) return this.items;
    const t = this.searchTerm.toLowerCase();
    return this.items.filter(i =>
      (i.agentName || '').toLowerCase().includes(t) ||
      (i.nationalityName || '').toLowerCase().includes(t) ||
      (i.agentCode || '').toLowerCase().includes(t)
    );
  }

  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }

  /** Lookup map for the Excel template: nationalityId column → { id, name }[] */
  get lookups(): LookupMap {
    return {
      nationalityId: this.nationalities
        .filter(n => n.id != null)
        .map(n => ({ id: n.id!, name: n.nationalityName }))
    };
  }

  /** Resolve nationality display name locally when the API response doesn't include it */
  getNationalityName(id?: number | null): string {
    if (id == null) return '';
    return this.nationalities.find(n => n.id === id)?.nationalityName || '';
  }

  openAdd(): void {
    this.model = { agentName: '' };
    this.isEdit = false;
    this.isModalOpen = true;
  }

  openEdit(item: Agent): void {
    this.model = { ...item };
    this.isEdit = true;
    this.isModalOpen = true;
  }

  closeModal(): void { this.isModalOpen = false; this.saving = false; }

  save(): void {
    if (!this.model.agentName) { alert('⚠️ Please fill in Agent Name'); return; }
    this.saving = true;
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateAgent(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createAgent(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }

  confirmDelete(item: Agent): void { this.deleteTarget = item; this.showDeleteConfirm = true; }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.id) {
      this.svc.deleteAgent(this.deleteTarget.id).subscribe(() => this.loadData());
    }
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }

  goBack(): void { this.router.navigate(['/operation/codes']); }
}
