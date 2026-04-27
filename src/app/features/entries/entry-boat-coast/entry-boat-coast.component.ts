import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  Boat, Excursion, ExcursionSupplier, PriceList, Nationality, Agent,
  EntryBoatCostRow, EntryBoatCostTotals, EntryBoatCostAgentSummary,
  EntryBoatCostPreviewRequest
} from '../../../core/interfaces/code.interfaces';
import { CodeService } from '../../../core/services/code.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-entry-boat-coast',
  standalone: false,
  templateUrl: './entry-boat-coast.component.html',
  styleUrl: './entry-boat-coast.component.scss'
})
export class EntryBoatCoastComponent implements OnInit {

  // Filter Models
  filters = {
    fromDate: '',
    toDate: '',
    boatId: undefined as number | undefined,
    excursionId: undefined as number | undefined,
    excursionSupplierId: undefined as number | undefined,
    priceListId: undefined as number | undefined,
    nationalityId: undefined as number | undefined,
    agentId: undefined as number | undefined
  };

  // Editable cost inputs (sent with preview/save)
  costs = {
    costBoatSupplierEGP: 0,
    costBoatSupplierUSD: 0,
    lunchEGP: 0,
    permissionEGP: 0,
    permissionUSD: 0,
    rentEquipEGP: 0,
    trulyEGP: 0,
    extraServiceEGP: 0,
    othersEGP: 0
  };

  // Dropdown Lists
  boats: Boat[] = [];
  excursions: Excursion[] = [];
  excursionSuppliers: ExcursionSupplier[] = [];
  priceLists: PriceList[] = [];
  nationalities: Nationality[] = [];
  agents: Agent[] = [];

  // Data
  rows: EntryBoatCostRow[] = [];
  totals: EntryBoatCostTotals = {};
  agentSummary: EntryBoatCostAgentSummary[] = [];
  rateCosts = {
    rateBoatSupplierEGP: 0,
    rateBoatSupplierUSD: 0,
    rateLunchEGP: 0,
    ratePermissionEGP: 0,
    ratePermissionUSD: 0,
    rateRentEquipEGP: 0,
    rateTrulyEGP: 0,
    rateExtraServiceEGP: 0,
    rateOthersEGP: 0
  };

  loading = false;
  saving = false;

  // Pagination
  pageSize = 10;
  currentPage = 1;

  // Confirm dialog
  showSaveConfirm = false;

  private auth = inject(AuthService);

  constructor(
    private codeService: CodeService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadDropdowns();
  }

  setDefaultDates(): void {
    const today = new Date().toISOString().split('T')[0];
    this.filters.fromDate = today;
    this.filters.toDate = today;
  }

  loadDropdowns(): void {
    this.loading = true;
    forkJoin({
      boats: this.codeService.getBoats(),
      excursions: this.codeService.getExcursions(),
      excursionSuppliers: this.codeService.getExcursionSuppliers(),
      priceLists: this.codeService.getPriceLists(),
      nationalities: this.codeService.getNationalities(),
      agents: this.codeService.getAgents()
    }).subscribe({
      next: (res) => {
        this.boats = res.boats;
        this.excursions = res.excursions;
        this.excursionSuppliers = res.excursionSuppliers;
        this.priceLists = res.priceLists;
        this.nationalities = res.nationalities;
        this.agents = res.agents;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dropdowns', err);
        this.loading = false;
      }
    });
  }

  get paginatedRows(): EntryBoatCostRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }

  private buildPayload(): any {
    const payload: any = {
      fromDate: this.filters.fromDate ? new Date(this.filters.fromDate).toISOString() : new Date().toISOString(),
      toDate: this.filters.toDate ? new Date(this.filters.toDate).toISOString() : new Date().toISOString()
    };
    if (this.filters.boatId) payload.boatId = this.filters.boatId;
    if (this.filters.excursionId) payload.excursionId = this.filters.excursionId;
    if (this.filters.excursionSupplierId) payload.excursionSupplierId = this.filters.excursionSupplierId;
    if (this.filters.priceListId) payload.priceListId = this.filters.priceListId;
    if (this.filters.nationalityId) payload.nationalityId = this.filters.nationalityId;
    if (this.filters.agentId) payload.agentId = this.filters.agentId;
    if (this.costs.costBoatSupplierEGP) payload.costBoatSupplierEGP = this.costs.costBoatSupplierEGP;
    if (this.costs.costBoatSupplierUSD) payload.costBoatSupplierUSD = this.costs.costBoatSupplierUSD;
    if (this.costs.lunchEGP) payload.lunchEGP = this.costs.lunchEGP;
    if (this.costs.permissionEGP) payload.permissionEGP = this.costs.permissionEGP;
    if (this.costs.permissionUSD) payload.permissionUSD = this.costs.permissionUSD;
    if (this.costs.rentEquipEGP) payload.rentEquipEGP = this.costs.rentEquipEGP;
    if (this.costs.trulyEGP) payload.trulyEGP = this.costs.trulyEGP;
    if (this.costs.extraServiceEGP) payload.extraServiceEGP = this.costs.extraServiceEGP;
    if (this.costs.othersEGP) payload.othersEGP = this.costs.othersEGP;
    return payload;
  }

  viewPreview(): void {
    this.loading = true;
    this.currentPage = 1;
    this.codeService.previewEntryBoatCosts(this.buildPayload()).subscribe({
      next: (res) => {
        this.rows = res.rows || [];
        this.totals = res.totals || {};
        this.agentSummary = res.agentSummary || [];
        this.rateCosts = {
          rateBoatSupplierEGP: res.rateBoatSupplierEGP || 0,
          rateBoatSupplierUSD: res.rateBoatSupplierUSD || 0,
          rateLunchEGP: res.rateLunchEGP || 0,
          ratePermissionEGP: res.ratePermissionEGP || 0,
          ratePermissionUSD: res.ratePermissionUSD || 0,
          rateRentEquipEGP: res.rateRentEquipEGP || 0,
          rateTrulyEGP: res.rateTrulyEGP || 0,
          rateExtraServiceEGP: res.rateExtraServiceEGP || 0,
          rateOthersEGP: res.rateOthersEGP || 0
        };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching preview', err);
        this.toast.error('Failed to load preview data');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCostChange(): void {
    if (this.rows.length > 0) {
      this.viewPreview();
    }
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

  clearFilter(): void {
    this.filters = {
      fromDate: '',
      toDate: '',
      boatId: undefined,
      excursionId: undefined,
      excursionSupplierId: undefined,
      priceListId: undefined,
      nationalityId: undefined,
      agentId: undefined
    };
    this.costs = {
      costBoatSupplierEGP: 0,
      costBoatSupplierUSD: 0,
      lunchEGP: 0,
      permissionEGP: 0,
      permissionUSD: 0,
      rentEquipEGP: 0,
      trulyEGP: 0,
      extraServiceEGP: 0,
      othersEGP: 0
    };
    this.setDefaultDates();
    this.rows = [];
    this.totals = {};
    this.agentSummary = [];
    this.rateCosts = {
      rateBoatSupplierEGP: 0,
      rateBoatSupplierUSD: 0,
      rateLunchEGP: 0,
      ratePermissionEGP: 0,
      ratePermissionUSD: 0,
      rateRentEquipEGP: 0,
      rateTrulyEGP: 0,
      rateExtraServiceEGP: 0,
      rateOthersEGP: 0
    };
    this.cdr.detectChanges();
  }

  confirmSave(): void {
    if (this.rows.length === 0) {
      this.toast.warning('No data to save. Please view preview first.');
      return;
    }
    this.showSaveConfirm = true;
  }

  onSaveConfirmed(): void {
    this.showSaveConfirm = false;
    this.saving = true;
    const payload = { ...this.buildPayload(), recordBy: this.auth?.currentUser()?.userName || '' };
    this.codeService.saveEntryBoatCosts(payload).subscribe({
      next: () => {
        this.toast.success('Boat cost data saved successfully');
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error saving', err);
        this.toast.error('Failed to save boat cost data');
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSaveCancelled(): void {
    this.showSaveConfirm = false;
  }
}
