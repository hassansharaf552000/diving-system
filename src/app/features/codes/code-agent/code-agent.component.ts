import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Agent } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-agent', standalone: false, templateUrl: './code-agent.component.html', styleUrl: './code-agent.component.scss' })
export class CodeAgentComponent implements OnInit {
  items: Agent[] = [];
  saving = false;
  model: Agent = { agentName: '' };
  isModalOpen = false;
  isEdit = false;
  searchTerm = '';
  showDeleteConfirm = false;
  deleteTarget: Agent | null = null;

  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.svc.getAgents().subscribe(d => { this.items = d; this.cdr.detectChanges(); });
  }

  get filtered(): Agent[] {
    if (!this.searchTerm) return this.items;
    const t = this.searchTerm.toLowerCase();
    return this.items.filter(i =>
      (i.agentName || '').toLowerCase().includes(t) ||
      (i.nationality || '').toLowerCase().includes(t) ||
      (i.agentCode || '').toLowerCase().includes(t)
    );
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

  goBack(): void { this.router.navigate(['/codes']); }
}
