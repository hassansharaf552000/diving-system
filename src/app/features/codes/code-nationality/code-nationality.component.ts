import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Nationality } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-nationality', standalone: false, templateUrl: './code-nationality.component.html', styleUrl: './code-nationality.component.scss' })
export class CodeNationalityComponent implements OnInit {
  items: Nationality[] = []; model: Nationality = { nationalityName: '' }; isModalOpen = false; isEdit = false; searchTerm = '';
  showDeleteConfirm = false; deleteTarget: Nationality | null = null;
  constructor(private svc: CodeService, private router: Router) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getNationalities().subscribe(d => this.items = d); }
  get filtered(): Nationality[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.nationalityName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { nationalityName: '' }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Nationality): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    if (!this.model.nationalityName) { alert('⚠️ Required'); return; }
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateNationality(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createNationality(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Nationality): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteNationality(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
