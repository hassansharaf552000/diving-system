import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { Guide } from '../../../core/interfaces/code.interfaces';

@Component({ selector: 'app-code-guide', standalone: false, templateUrl: './code-guide.component.html', styleUrl: './code-guide.component.scss' })
export class CodeGuideComponent implements OnInit {
  items: Guide[] = []; model: Guide = { guideName: '' }; isModalOpen = false; isEdit = false; searchTerm = '';
  showDeleteConfirm = false; deleteTarget: Guide | null = null;
  constructor(private svc: CodeService, private router: Router) { }
  ngOnInit(): void { this.loadData(); }
  loadData(): void { this.svc.getGuides().subscribe(d => this.items = d); }
  get filtered(): Guide[] { if (!this.searchTerm) return this.items; const t = this.searchTerm.toLowerCase(); return this.items.filter(i => (i.guideName || '').toLowerCase().includes(t)); }
  openAdd(): void { this.model = { guideName: '' }; this.isEdit = false; this.isModalOpen = true; }
  openEdit(item: Guide): void { this.model = { ...item }; this.isEdit = true; this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
  save(): void {
    if (!this.model.guideName) { alert('⚠️ Required'); return; }
    this.model.recordBy = 'Ibram Wahib';
    if (this.isEdit && this.model.id) {
      this.svc.updateGuide(this.model.id, this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    } else {
      this.svc.createGuide(this.model).subscribe(() => { this.loadData(); this.closeModal(); });
    }
  }
  confirmDelete(item: Guide): void { this.deleteTarget = item; this.showDeleteConfirm = true; }
  onDeleteConfirmed(): void { if (this.deleteTarget?.id) { this.svc.deleteGuide(this.deleteTarget.id).subscribe(() => this.loadData()); } this.showDeleteConfirm = false; this.deleteTarget = null; }
  onDeleteCancelled(): void { this.showDeleteConfirm = false; this.deleteTarget = null; }
  goBack(): void { this.router.navigate(['/codes']); }
}
