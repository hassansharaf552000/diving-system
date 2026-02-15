import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Rep, Agent } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-rep', standalone: false, templateUrl: './code-rep.component.html', styleUrl: './code-rep.component.scss' })
export class CodeRepComponent implements OnInit {
  items: Rep[] = []; model: Rep = { repName: '' }; isModalOpen = false; isEdit = false; searchTerm = '';
  agents: Agent[] = [];
  showDeleteConfirm = false; deleteTarget: Rep | null = null;
  constructor(private svc: CodeService, private router: Router) { }
  ngOnInit(): void { this.loadData(); this.svc.getAgents().subscribe(d => this.agents = d); }
  loadData(): void { this.svc.getReps().subscribe(d => this.items = d); }
  get filtered(): Rep[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.repName || '').toLowerCase().includes(t) || (i.agentName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { repName: '' }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Rep): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    if (!this.model.repName) { alert('⚠️ Required'); return; }
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateRep(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createRep(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Rep): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteRep(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
