import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Rep, Agent } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-rep', standalone: false, templateUrl: './code-rep.component.html', styleUrl: './code-rep.component.scss' })
export class CodeRepComponent implements OnInit {
  items: Rep[] = []; model: Rep = { repName: '', address: '', phone: '', isActive: false }; isModalOpen = false; isEdit = false; searchTerm = ''; saving = false;
  agents: Agent[] = [];
  showDeleteConfirm = false; deleteTarget: Rep | null = null;
  constructor(private svc: CodeService, private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void { this.loadData(); this.svc.getAgents().subscribe(d => { this.agents = d; this.cdr.detectChanges(); }); }
  loadData(): void { this.svc.getReps().subscribe(d => { this.items = d; this.cdr.detectChanges(); }); }
  get filtered(): Rep[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.repName || '').toLowerCase().includes(t) || (i.agentName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { repName: '', address: '', phone: '', isActive: false }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Rep): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; this.saving = false; }
  save(): void {
    if (!this.model.repName) { alert('⚠️ Required'); return; }
    this.saving = true;
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateRep(this.model.id, this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    } else {
      this.svc.createRep(this.model).subscribe(() => { this.saving = false; this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Rep): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteRep(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
