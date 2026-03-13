import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  EntryTraffic, EntryTransactionGuide, Excursion, Guide, PriceList, Agent, Hotel,
  Nationality, ExcursionSupplier, Boat, TransportationSupplier
} from '../../../core/interfaces/code.interfaces';
import { CodeService } from '../../../core/services/code.service';

@Component({
  selector: 'app-entry-traffic',
  standalone: false,
  templateUrl: './entry-traffic.component.html',
  styleUrl: './entry-traffic.component.scss'
})
export class EntryTrafficComponent implements OnInit {

  // Filter Models
  filters = {
    fromDate: '',
    toDate: '',
    excursionId: undefined as number | undefined,
    priceListId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    hotelId: undefined as number | undefined,
    nationalityId: undefined as number | undefined,
    excursionSupplierId: undefined as number | undefined,
    boatId: undefined as number | undefined,
    transportationSupplierId: undefined as number | undefined
  };

  // Dropdown Lists
  excursions: Excursion[] = [];
  priceLists: PriceList[] = [];
  agents: Agent[] = [];
  hotels: Hotel[] = [];
  nationalities: Nationality[] = [];
  excursionSuppliers: ExcursionSupplier[] = [];
  boats: Boat[] = [];
  transportationSuppliers: TransportationSupplier[] = [];
  guides: Guide[] = [];

  // Data
  trafficData: EntryTraffic[] = [];
  totals: any = {};
  loading = false;
  selectedRow: EntryTraffic | null = null;

  // ===== Guide Assignment Modal =====
  isGuideModalOpen = false;
  guideModalTitle = '';
  activeTransactionId: number | null = null;
  assignedGuides: EntryTransactionGuide[] = [];
  loadingGuides = false;
  savingGuide = false;
  isEditGuide = false;
  guideModel: { id?: number; guideId: number | undefined; guideDuty: string; costGuideEGP: number } = this.emptyGuideModel();

  // Searchable guide dropdown
  guideSearchTerm = '';
  showGuideDrop = false;

  // Guide delete confirm
  showDeleteGuideConfirm = false;
  deleteGuideTarget: EntryTransactionGuide | null = null;

  constructor(
    private codeService: CodeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadDropdowns();
    this.viewTraffic();
  }

  setDefaultDates() {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    this.filters.fromDate = formatted;
    this.filters.toDate = formatted;
  }

  loadDropdowns() {
    this.loading = true;
    forkJoin({
      excursions: this.codeService.getExcursions(),
      priceLists: this.codeService.getPriceLists(),
      agents: this.codeService.getAgents(),
      hotels: this.codeService.getHotels(),
      nationalities: this.codeService.getNationalities(),
      excursionSuppliers: this.codeService.getExcursionSuppliers(),
      boats: this.codeService.getBoats(),
      transportationSuppliers: this.codeService.getTransportationSuppliers(),
      guides: this.codeService.getGuides()
    }).subscribe({
      next: (res) => {
        this.excursions = res.excursions;
        this.priceLists = res.priceLists;
        this.agents = res.agents;
        this.hotels = res.hotels;
        this.nationalities = res.nationalities;
        this.excursionSuppliers = res.excursionSuppliers;
        this.boats = res.boats;
        this.transportationSuppliers = res.transportationSuppliers;
        this.guides = res.guides;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dropdowns', err);
        this.loading = false;
      }
    });
  }

  pageSize = 10;
  currentPage = 1;
  get paginatedTrafficData() { const start = (this.currentPage - 1) * this.pageSize; return this.trafficData.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }

  viewTraffic() {
    this.loading = true;
    this.currentPage = 1;
    this.codeService.getEntryTraffic(this.filters).subscribe({
      next: (res: any) => {
        this.trafficData = res?.rows || res || [];
        this.totals = res?.totals || {};
        this.selectedRow = null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching traffic data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onExcursionChange(excursionId: number | undefined): void {
    if (excursionId) {
      const excursion = this.excursions.find(e => e.id === excursionId);
      if (excursion?.supplierId) {
        this.filters.excursionSupplierId = excursion.supplierId;
      }
    } else {
      this.filters.excursionSupplierId = undefined;
    }
  }

  onAgentChange(agentId: number | undefined): void {
    if (agentId) {
      const agent = this.agents.find(a => a.id === agentId);
      if (agent?.nationalityId) {
        this.filters.nationalityId = agent.nationalityId;
      }
    } else {
      this.filters.nationalityId = undefined;
    }
  }

  clearFilter() {
    this.filters = {
      fromDate: '',
      toDate: '',
      excursionId: undefined,
      priceListId: undefined,
      agentId: undefined,
      hotelId: undefined,
      nationalityId: undefined,
      excursionSupplierId: undefined,
      boatId: undefined,
      transportationSupplierId: undefined
    };
    this.setDefaultDates();
    this.trafficData = [];
    this.totals = {};
    this.selectedRow = null;
    this.cdr.detectChanges();
  }

  // Derived Summary Counts
  get totalADL(): number {
    return this.totals?.totalADL || 0;
  }

  get totalCHD(): number {
    return this.totals?.totalCHD || 0;
  }

  get totalINF(): number {
    return this.totals?.totalINF || 0;
  }

  get totalCount(): number {
    return this.totals?.count || 0;
  }

  // ============ GUIDE ASSIGNMENT ============

  get filteredGuides(): Guide[] {
    if (!this.guideSearchTerm) return this.guides;
    const term = this.guideSearchTerm.toLowerCase();
    return this.guides.filter(g => g.guideName.toLowerCase().includes(term));
  }

  openGuideModal(row: EntryTraffic): void {
    this.activeTransactionId = row['entryTransactionId'] ?? null;
    if (!this.activeTransactionId) { alert('No transaction ID for this row.'); return; }
    this.guideModalTitle = `Assign Guides — ${row['voucherNumber'] || ''} ${row.excursionName || ''}`.trim();
    this.isEditGuide = false;
    this.guideModel = this.emptyGuideModel();
    this.guideSearchTerm = '';
    this.showGuideDrop = false;
    this.isGuideModalOpen = true;
    this.loadAssignedGuides();
  }

  closeGuideModal(): void {
    this.isGuideModalOpen = false;
    this.activeTransactionId = null;
    this.assignedGuides = [];
    this.guideModel = this.emptyGuideModel();
    this.isEditGuide = false;
    this.guideSearchTerm = '';
  }

  loadAssignedGuides(): void {
    if (!this.activeTransactionId) return;
    this.loadingGuides = true;
    this.codeService.getEntryTransactionGuides(this.activeTransactionId).subscribe({
      next: (data) => {
        this.assignedGuides = data;
        this.loadingGuides = false;
        this.cdr.detectChanges();
      },
      error: (err) => { console.error(err); this.loadingGuides = false; this.cdr.detectChanges(); }
    });
  }

  selectGuide(g: Guide): void {
    this.guideModel.guideId = g.id;
    this.guideSearchTerm = g.guideName;
    this.showGuideDrop = false;
    this.cdr.detectChanges();
  }

  onGuideInputBlur(): void {
    setTimeout(() => { this.showGuideDrop = false; this.cdr.detectChanges(); }, 200);
  }

  openEditGuide(ag: EntryTransactionGuide): void {
    this.isEditGuide = true;
    this.guideModel = { id: ag.id, guideId: ag.guideId, guideDuty: ag.guideDuty || '', costGuideEGP: ag.costGuideEGP || 0 };
    const found = this.guides.find(g => g.id === ag.guideId);
    this.guideSearchTerm = found?.guideName || ag.guideName || '';
    this.showGuideDrop = false;
    this.cdr.detectChanges();
  }

  cancelEditGuide(): void {
    this.isEditGuide = false;
    this.guideModel = this.emptyGuideModel();
    this.guideSearchTerm = '';
  }

  saveGuide(): void {
    if (!this.guideModel.guideId) { alert('Please select a guide.'); return; }
    if (!this.activeTransactionId) return;
    this.savingGuide = true;

    const payload = {
      entryTransactionId: this.activeTransactionId,
      guideId: this.guideModel.guideId,
      guideDuty: this.guideModel.guideDuty,
      costGuideEGP: this.guideModel.costGuideEGP,
      recordBy: ''
    };

    const obs = this.isEditGuide && this.guideModel.id
      ? this.codeService.updateEntryTransactionGuide(this.guideModel.id, payload)
      : this.codeService.createEntryTransactionGuide(payload);

    const isEdit = this.isEditGuide && !!this.guideModel.id;
    const editId = this.guideModel.id;
    const guideName = this.guides.find(g => g.id === this.guideModel.guideId)?.guideName || '';

    obs.subscribe({
      next: (saved: EntryTransactionGuide) => {
        this.savingGuide = false;
        if (isEdit) {
          const idx = this.assignedGuides.findIndex(g => g.id === editId);
          if (idx !== -1) {
            this.assignedGuides[idx] = { ...saved, guideName: saved.guideName || guideName };
          }
        } else {
          this.assignedGuides = [...this.assignedGuides, { ...saved, guideName: saved.guideName || guideName }];
        }
        this.isEditGuide = false;
        this.guideModel = this.emptyGuideModel();
        this.guideSearchTerm = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingGuide = false;
        console.error(err);
        alert('Failed to save guide: ' + (err.error?.message || err.message));
        this.cdr.detectChanges();
      }
    });
  }

  confirmDeleteGuide(ag: EntryTransactionGuide): void {
    this.deleteGuideTarget = ag;
    this.showDeleteGuideConfirm = true;
  }

  onDeleteGuideConfirmed(): void {
    if (this.deleteGuideTarget?.id) {
      const deletedId = this.deleteGuideTarget.id;
      this.codeService.deleteEntryTransactionGuide(deletedId).subscribe({
        next: () => {
          this.assignedGuides = this.assignedGuides.filter(g => g.id !== deletedId);
          this.cdr.detectChanges();
        },
        error: (err) => { console.error(err); alert('Failed to delete guide assignment.'); }
      });
    }
    this.showDeleteGuideConfirm = false;
    this.deleteGuideTarget = null;
  }

  onDeleteGuideCancelled(): void {
    this.showDeleteGuideConfirm = false;
    this.deleteGuideTarget = null;
  }

  private emptyGuideModel() {
    return { id: undefined as number | undefined, guideId: undefined as number | undefined, guideDuty: '', costGuideEGP: 0 };
  }
}
