import Swal from 'sweetalert2';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  EntryTraffic, EntryTransactionGuide, Excursion, Guide, PriceList, Agent, Hotel,
  Nationality, ExcursionSupplier, Boat, TransportationSupplier, EntryTransactionInline,
  HotelDestination, Rep, TransportationType
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
  hotelDestinations: HotelDestination[] = [];
  nationalities: Nationality[] = [];
  excursionSuppliers: ExcursionSupplier[] = [];
  boats: Boat[] = [];
  transportationSuppliers: TransportationSupplier[] = [];
  transportationTypes: TransportationType[] = [];
  guides: Guide[] = [];
  reps: Rep[] = [];

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

  // ===== Inline Update Modal =====
  isUpdateModalOpen = false;
  updateModalTitle = '';
  activeUpdateTransactionId: number | null = null;
  savingInline = false;
  inlineModel: EntryTransactionInline = this.emptyInlineModel();
  originalInlineValues: any = {};

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
      hotelDestinations: this.codeService.getHotelDestinations(),
      nationalities: this.codeService.getNationalities(),
      excursionSuppliers: this.codeService.getExcursionSuppliers(),
      boats: this.codeService.getBoats(),
      transportationSuppliers: this.codeService.getTransportationSuppliers(),
      transportationTypes: this.codeService.getTransportationTypes(),
      guides: this.codeService.getGuides(),
      reps: this.codeService.getReps()
    }).subscribe({
      next: (res) => {
        this.excursions = res.excursions;
        this.priceLists = res.priceLists;
        this.agents = res.agents;
        this.hotels = res.hotels;
        this.hotelDestinations = res.hotelDestinations;
        this.nationalities = res.nationalities;
        this.excursionSuppliers = res.excursionSuppliers;
        this.boats = res.boats;
        this.transportationSuppliers = res.transportationSuppliers;
        this.transportationTypes = res.transportationTypes;
        this.guides = res.guides;
        this.reps = res.reps;
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
    if (!this.activeTransactionId) { Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('No transaction ID for this row.'); return; }
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
    if (!this.guideModel.guideId) { Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Please select a guide.'); return; }
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
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to save guide: ' + (err.error?.message || err.message));
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
        error: (err) => { console.error(err); Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to delete guide assignment.'); }
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

  // ============ INLINE UPDATE ============

  openUpdateModal(row: EntryTraffic): void {
    const txId = row['entryTransactionId'] as number | undefined;
    if (!txId) { Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('No transaction ID for this row.'); return; }
    
    this.activeUpdateTransactionId = txId;
    this.updateModalTitle = `✏️ Update — ${row['voucherNumber'] || ''} ${row.excursionName || ''}`.trim();
    
    this.inlineModel = {
      entryTransactionId: txId,
      voucherNumber: row['voucherNumber'] ?? null,
      transactionDate: row['transactionDate'] ? (row['transactionDate'] as string).split('T')[0] : null,
      
      repName: row['repName'] ?? null,
      agentName: row['agentName'] ?? null,
      nationalityName: row['nationalityName'] ?? null,
      hotelName: row['hotelName'] ?? null,
      hotelDestinationName: row['hotelDestinationName'] ?? null,
      roomNumber: row['roomNumber'] ?? null,
      pickUpTime: row['pickUpTime'] ?? null,
      
      excursionName: row['excursionName'] ?? null,
      priceListName: row['priceListName'] ?? null,
      excursionSupplierName: row['excursionSupplierName'] ?? null,
      
      adl: row['adl'] ?? null,
      chd: row['chd'] ?? null,
      inf: row['inf'] ?? null,

      costSupplierEGP: row['costSupplierEGP'] ?? null,
      costSupplierUSD: row['costSupplierUSD'] ?? null,
      costSupplierEUR: row['costSupplierEUR'] ?? null,
      costSupplierGBP: row['costSupplierGBP'] ?? null,
      freeSupplierCost: row['freeSupplierCost'] === true || row['freeSupplierCost'] === 'true' || row['freeSupplierCost'] === 'Yes',

      guideEntryId: row['guideEntryId'] ?? null,
      guideId: row['guideId'] ?? null,
      guideName: row['guideName'] ?? null,
      guideDuty: row['guideDuty'] ?? null,
      costGuideEGP: row['costGuideEGP'] ?? null,

      boatId: row['boatId'] ?? null,
      boatName: row['boatName'] ?? null,
      carTypeId: row['carTypeId'] ?? null,
      carTypeName: row['carTypeName'] ?? null,
      transportationSupplierId: row['transportationSupplierId'] ?? null,
      transportationSupplierName: row['transportationSupplierName'] ?? null,
      
      round: row['round'] ?? null,
      orderNumber: row['orderNumber'] != null ? String(row['orderNumber']) : null,

      sellingEGP: row['sellingEGP'] ?? null,
      sellingUSD: row['sellingUSD'] ?? null,
      sellingEUR: row['sellingEUR'] ?? null,
      sellingGBP: row['sellingGBP'] ?? null,
      sellingFree: row['sellingFree'] === true || row['sellingFree'] === 'true' || row['sellingFree'] === 'Yes',
      paymentType: row['paymentType'] ?? null,
      
      note: row['note'] ?? null,
      recordBy: row['recordBy'] ?? null,
      recordTime: row['recordTime'] ?? null
    };

    // Store original values for diffing the editable fields
    this.originalInlineValues = {
      guideId: this.inlineModel.guideId,
      guideDuty: this.inlineModel.guideDuty,
      costGuideEGP: this.inlineModel.costGuideEGP,
      boatId: this.inlineModel.boatId,
      carTypeId: this.inlineModel.carTypeId,
      transportationSupplierId: this.inlineModel.transportationSupplierId,
      round: this.inlineModel.round,
      orderNumber: this.inlineModel.orderNumber,
      hotelName: this.inlineModel.hotelName
    };

    this.isUpdateModalOpen = true;
  }

  closeUpdateModal(): void {
    this.isUpdateModalOpen = false;
    this.activeUpdateTransactionId = null;
    this.inlineModel = this.emptyInlineModel();
    this.cdr.detectChanges();
  }

  saveInline(): void {
    const txId = this.inlineModel.entryTransactionId;
    if (!txId) return;

    // Only send fields that actually changed
    const payload: Partial<EntryTransactionInline> = { entryTransactionId: txId };
    const editableFields = [
      'guideId', 'guideDuty', 'costGuideEGP', 'boatId', 'carTypeId',
      'transportationSupplierId', 'round', 'orderNumber', 'hotelName'
    ];

    let hasChanges = false;
    editableFields.forEach(field => {
      const currentVal = this.inlineModel[field as keyof EntryTransactionInline];
      const origVal = this.originalInlineValues[field];
      if (currentVal !== origVal) {
         (payload as any)[field] = currentVal;
         hasChanges = true;
      }
    });

    if (!hasChanges) {
      this.closeUpdateModal();
      return;
    }

    this.savingInline = true;

    // Resolve Names locally for the table row
    if (this.inlineModel.boatId) {
       this.inlineModel.boatName = this.boats.find(b => b.id === this.inlineModel.boatId)?.boatName ?? null;
    }
    if (this.inlineModel.transportationSupplierId) {
       this.inlineModel.transportationSupplierName = this.transportationSuppliers.find(s => s.id === this.inlineModel.transportationSupplierId)?.supplierName ?? null;
    }
    if (this.inlineModel.carTypeId) {
       this.inlineModel.carTypeName = this.transportationTypes.find(t => t.id === this.inlineModel.carTypeId)?.typeName ?? null;
    }
    if (this.inlineModel.guideId) {
       this.inlineModel.guideName = this.guides.find(s => s.id === this.inlineModel.guideId)?.guideName ?? null;
    }

    this.codeService.patchEntryTransactionInline(txId, payload).subscribe({
      next: (res) => {
        this.savingInline = false;
        
        // Update ONLY what changed in the row
        const row = this.trafficData.find(t => t['entryTransactionId'] === txId);
        if (row) {
          editableFields.forEach(field => {
            const currentVal = this.inlineModel[field as keyof EntryTransactionInline];
            const origVal = this.originalInlineValues[field];
            if (currentVal !== origVal) {
               row[field] = currentVal;
            }
          });
          // Also update the resolved names in the row
          if (payload.boatId !== undefined) row['boatName'] = this.inlineModel.boatName ?? undefined;
          if (payload.transportationSupplierId !== undefined) row['transportationSupplierName'] = this.inlineModel.transportationSupplierName ?? undefined;
          if (payload.carTypeId !== undefined) row['carTypeName'] = this.inlineModel.carTypeName ?? undefined;
          if (payload.guideId !== undefined) row['guideName'] = this.inlineModel.guideName ?? undefined;
        }

        this.closeUpdateModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingInline = false;
        console.error(err);
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to save: ' + (err.error?.message || err.message));
        this.cdr.detectChanges();
      }
    });
  }

  private emptyInlineModel(): EntryTransactionInline {
    return {
      entryTransactionId: undefined,
      voucherNumber: null,
      transactionDate: null,
      repName: null, agentName: null, nationalityName: null,
      hotelName: null, hotelDestinationName: null, roomNumber: null, pickUpTime: null,
      excursionName: null, excursionSupplierName: null, priceListName: null,
      adl: null, chd: null, inf: null,
      costSupplierEGP: null, costSupplierUSD: null, costSupplierEUR: null, costSupplierGBP: null, freeSupplierCost: false,
      guideEntryId: null, guideId: null, guideName: null, guideDuty: null, costGuideEGP: null,
      boatId: null, boatName: null, carTypeId: null, carTypeName: null, transportationSupplierId: null, transportationSupplierName: null,
      round: null, orderNumber: null,
      sellingEGP: null, sellingUSD: null, sellingEUR: null, sellingGBP: null, sellingFree: false, paymentType: null,
      note: null, recordBy: null, recordTime: null
    };
  }
}
