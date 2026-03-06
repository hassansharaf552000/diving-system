import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  EntryTransaction, Rep, Agent, Nationality, Hotel, HotelDestination,
  Excursion, ExcursionSupplier, PriceList, Voucher, ExcursionCostSelling
} from '../../../core/interfaces/code.interfaces';
import { CodeService } from '../../../core/services/code.service';

@Component({
  selector: 'app-entry-transaction',
  standalone: false,
  templateUrl: './entry-transaction.component.html',
  styleUrl: './entry-transaction.component.scss'
})
export class EntryTransactionComponent implements OnInit {

  // Search
  searchTerm = '';
  
  // Data
  transactions: EntryTransaction[] = [];
  
  // Dropdown data
  reps: Rep[] = [];
  agents: Agent[] = [];
  nationalities: Nationality[] = [];
  hotels: Hotel[] = [];
  destinations: HotelDestination[] = [];
  excursions: Excursion[] = [];
  suppliers: ExcursionSupplier[] = [];
  priceLists: PriceList[] = [];
  vouchers: Voucher[] = [];
  costSellings: ExcursionCostSelling[] = [];
  matchedRate: ExcursionCostSelling | null = null;
  // Base selling prices (before discount) — stored so discount can be re-applied correctly
  private baseSellingEGP = 0; private baseSellingUSD = 0;
  private baseSellingEUR = 0; private baseSellingGBP = 0;
  paymentTypes: string[] = ['Cash', 'Credit', 'FOC'];

  // Excel Columns
  exportColumns: string[] = [
    'voucherNumber', 'transactionDate', 'boatName', 'repName', 'agentName', 
    'nationalityName', 'hotelName', 'roomNumber', 'pickUpTime', 'hotelDestinationName',
    'excursionName', 'excursionSupplierName', 'priceListName', 'paymentType',
    'adl', 'chd', 'inf', 'note',
    'sellingUSD', 'sellingEGP', 'sellingEUR', 'sellingGBP',
    'costUSD', 'costEGP', 'costEUR', 'costGBP',
    'revenueDate', 'revenueRecNo', 'revenueUSD', 'revenueEGP', 'revenueEUR', 'revenueGBP',
    'refundDate', 'refundRecNo', 'refundUSD', 'refundEGP', 'refundEUR', 'refundGBP',
    'discountUSD', 'discountEGP', 'discountEUR', 'discountGBP',
    'carTypeName', 'transportationSupplierName', 'round', 'orderNumber'
  ];

  // Modal state
  isModalOpen = false;
  isEdit = false;
  saving = false;
  
  // Header model
  model: EntryTransaction = this.emptyModel();

  // Delete dialog
  showDeleteConfirm = false;
  deleteTarget: EntryTransaction | null = null;

  constructor(
    private svc: CodeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.searchTransactions();
  }

  // ============ HELPERS ============
  get currentDayName(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }

  get currentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  goBack(): void {
    this.router.navigate(['/operation/entries']);
  }

  // ============ DROPDOWN LOADING ============
  loadDropdowns(): void {
    forkJoin({
      reps: this.svc.getReps(),
      agents: this.svc.getAgents(),
      nationalities: this.svc.getNationalities(),
      hotels: this.svc.getHotels(),
      destinations: this.svc.getHotelDestinations(),
      excursions: this.svc.getExcursions(),
      suppliers: this.svc.getExcursionSuppliers(),
      priceLists: this.svc.getPriceLists(),
      vouchers: this.svc.getVouchers(),
      costSellings: this.svc.getExcursionCostSellings()
    }).subscribe({
      next: (data: any) => {
        this.reps = data.reps;
        this.agents = data.agents;
        this.nationalities = data.nationalities;
        this.hotels = data.hotels;
        this.destinations = data.destinations;
        this.excursions = data.excursions;
        this.suppliers = data.suppliers;
        this.priceLists = data.priceLists;
        this.vouchers = data.vouchers;
        this.costSellings = data.costSellings;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading dropdowns:', err)
    });
  }

  // ============ AUTO-POPULATE ============

  /** When voucher number changes, find the matching voucher and auto-set the Rep */
  onVoucherChange(): void {
    const num = parseInt(this.model.voucherNumber || '', 10);
    if (isNaN(num)) { return; }
    const match = this.vouchers.find(
      v => v.fromNumber != null && v.toNumber != null && num >= v.fromNumber && num <= v.toNumber
    );
    if (match?.repId) {
      this.model.repId = match.repId;
      this.onRepChange();
      this.cdr.detectChanges();
    }
  }

  /** When rep changes, auto-set Agent from the rep's record */
  onRepChange(): void {
    const rep = this.reps.find(r => r.id === this.model.repId);
    if (rep?.agentId) {
      this.model.agentId = rep.agentId;
      // Also trigger agent change to auto-set nationality
      this.onAgentChange();
    }
  }

  /** When agent changes, auto-set Nationality from the agent's record */
  onAgentChange(): void {
    const agent = this.agents.find(a => a.id === this.model.agentId);
    if (agent?.nationalityId) {
      this.model.nationalityId = agent.nationalityId;
    }
    this.findMatchingCostSelling();
  }

  /** When excursion changes, auto-set Supplier from the excursion's default supplier */
  onExcursionChange(): void {
    const excursion = this.excursions.find(e => e.id === this.model.excursionId);
    if (excursion?.supplierId) {
      this.model.excursionSupplierId = excursion.supplierId;
    }
    this.findMatchingCostSelling();
  }

  /** Called when any of the 5 filter fields change to re-match the cost selling record */
  onFilterChange(): void {
    this.findMatchingCostSelling();
  }

  /**
   * Finds the best-matching ExcursionCostSelling record.
   * Scoring: each matching optional field adds 1 point (null field in record = match any).
   * Excursion is mandatory. Highest score wins.
   */
  findMatchingCostSelling(): void {
    if (!this.model.excursionId) { this.matchedRate = null; return; }

    let best: ExcursionCostSelling | null = null;
    let bestScore = -1;

    for (const cs of this.costSellings) {
      if (cs.excursionId !== this.model.excursionId) continue; // must match

      let score = 0;
      if (cs.agentId        == null || cs.agentId        === this.model.agentId)           score++;
      if (cs.destinationId  == null || cs.destinationId  === this.model.hotelDestinationId) score++;
      if (cs.supplierId     == null || cs.supplierId     === this.model.excursionSupplierId) score++;
      if (cs.priceListId    == null || cs.priceListId    === this.model.priceListId)         score++;

      if (score > bestScore) { bestScore = score; best = cs; }
    }

    this.matchedRate = best;
    this.recalculatePrices();
    this.cdr.detectChanges();
  }

  /** Multiplies matched unit rates by ADL / CHD pax counts and fills all price fields */
  recalculatePrices(): void {
    if (!this.matchedRate) return;

    const adl = this.model.adl || 0;
    const chd = this.model.chd || 0;
    const r   = this.matchedRate;

    // Store base (gross) selling before discount
    this.baseSellingEGP = (adl * (r.sellingAdlEGP || 0)) + (chd * (r.sellingChdEGP || 0));
    this.baseSellingUSD = (adl * (r.sellingAdlUSD || 0)) + (chd * (r.sellingChdUSD || 0));
    this.baseSellingEUR = (adl * (r.sellingAdlEUR || 0)) + (chd * (r.sellingChdEUR || 0));
    this.baseSellingGBP = (adl * (r.sellingAdlGBP || 0)) + (chd * (r.sellingChdGBP || 0));

    this.model.costEGP = (adl * (r.costAdlEGP || 0)) + (chd * (r.costChdEGP || 0));
    this.model.costUSD = (adl * (r.costAdlUSD || 0)) + (chd * (r.costChdUSD || 0));
    this.model.costEUR = (adl * (r.costAdlEUR || 0)) + (chd * (r.costChdEUR || 0));
    this.model.costGBP = (adl * (r.costAdlGBP || 0)) + (chd * (r.costChdGBP || 0));

    // Apply any existing discount on top of new base prices
    this.applyDiscount();
    this.cdr.detectChanges();
  }

  /** Called when any discount field changes — subtracts discount from base selling */
  onDiscountChange(): void {
    this.applyDiscount();
    this.cdr.detectChanges();
  }

  private applyDiscount(): void {
    // Always subtract discount from base selling (base = 0 means no rate matched, selling stays 0)
    this.model.sellingEGP = Math.max(0, this.baseSellingEGP - (this.model.discountEGP || 0));
    this.model.sellingUSD = Math.max(0, this.baseSellingUSD - (this.model.discountUSD || 0));
    this.model.sellingEUR = Math.max(0, this.baseSellingEUR - (this.model.discountEUR || 0));
    this.model.sellingGBP = Math.max(0, this.baseSellingGBP - (this.model.discountGBP || 0));
  }

  // ============ SEARCH ============
  searchTransactions(): void {
    this.svc.getEntryTransactions(this.searchTerm || undefined).subscribe({
      next: (data: EntryTransaction[]) => {
        this.transactions = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error searching transactions:', err)
    });
  }

  // ============ ADD NEW ============
  openAdd(): void {
    this.model = this.emptyModel();
    // Default dates
    this.model.transactionDate = this.currentDate;
    this.model.revenueDate = this.currentDate;
    this.model.refundDate = this.currentDate;
    // Reset base selling
    this.baseSellingEGP = 0; this.baseSellingUSD = 0;
    this.baseSellingEUR = 0; this.baseSellingGBP = 0;
    this.matchedRate = null;
    this.isEdit = false;
    this.isModalOpen = true;
  }

  // ============ EDIT ============
  openEdit(tx: EntryTransaction): void {
    if (tx.entryTransactionId) {
      this.svc.getEntryTransaction(tx.entryTransactionId).subscribe({
        next: (full: EntryTransaction) => {
          this.model = { ...full };
          
          if (this.model.transactionDate) this.model.transactionDate = this.model.transactionDate.split('T')[0];
          if (this.model.revenueDate) this.model.revenueDate = this.model.revenueDate.split('T')[0];
          if (this.model.refundDate) this.model.refundDate = this.model.refundDate.split('T')[0];

          // Initialize base selling = current selling + any existing discount (restore gross value)
          this.baseSellingEGP = (this.model.sellingEGP || 0) + (this.model.discountEGP || 0);
          this.baseSellingUSD = (this.model.sellingUSD || 0) + (this.model.discountUSD || 0);
          this.baseSellingEUR = (this.model.sellingEUR || 0) + (this.model.discountEUR || 0);
          this.baseSellingGBP = (this.model.sellingGBP || 0) + (this.model.discountGBP || 0);
          this.matchedRate = null;
          
          this.isEdit = true;
          this.isModalOpen = true;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error loading transaction for edit:', err)
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saving = false;
    this.matchedRate = null;
    this.baseSellingEGP = 0; this.baseSellingUSD = 0;
    this.baseSellingEUR = 0; this.baseSellingGBP = 0;
    this.cdr.detectChanges();
  }

  // ============ SAVE ============
  save(): void {
    if (!this.model.voucherNumber) {
      alert('⚠️ Please enter a Voucher Number');
      return;
    }
    
    this.saving = true;
    
    // Convert dates to ISO string for API
    const payload: any = { ...this.model };
    
    try {
      if (payload.transactionDate) payload.transactionDate = new Date(payload.transactionDate).toISOString();
      else payload.transactionDate = null;
      
      if (payload.revenueDate) payload.revenueDate = new Date(payload.revenueDate).toISOString();
      else payload.revenueDate = null;
      
      if (payload.refundDate) payload.refundDate = new Date(payload.refundDate).toISOString();
      else payload.refundDate = null;
    } catch (e) {
      this.saving = false;
      alert('Invalid date format.');
      return;
    }

    if (this.isEdit && this.model.entryTransactionId) {
      this.svc.updateEntryTransaction(this.model.entryTransactionId, payload).subscribe({
        next: () => { 
          this.saving = false; 
          this.closeModal(); 
          this.searchTransactions(); 
        },
        error: (err: any) => { 
          this.saving = false; 
          console.error('Update error:', err); 
          alert('Failed to update: ' + (err.error?.message || err.message)); 
        }
      });
    } else {
      payload.recordTime = new Date().toISOString();
      this.svc.createEntryTransaction(payload).subscribe({
        next: () => { 
          this.saving = false; 
          this.closeModal(); 
          this.searchTransactions(); 
        },
        error: (err: any) => { 
          this.saving = false; 
          console.error('Create error:', err); 
          alert('Failed to create: ' + (err.error?.message || err.message)); 
        }
      });
    }
  }

  // ============ DELETE ============
  confirmDelete(tx: EntryTransaction): void {
    this.deleteTarget = tx;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.entryTransactionId) {
      this.svc.deleteEntryTransaction(this.deleteTarget.entryTransactionId).subscribe({
        next: () => {
          this.searchTransactions();
        },
        error: (err: any) => { console.error('Delete error:', err); alert('Failed to delete'); }
      });
    }
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  private emptyModel(): EntryTransaction {
    return {
      voucherNumber: '',
      transactionDate: '',
      repId: undefined,
      agentId: undefined,
      nationalityId: undefined,
      hotelId: undefined,
      hotelDestinationId: undefined,
      excursionId: undefined,
      excursionSupplierId: undefined,
      priceListId: undefined,
      paymentType: 'Cash',
      roomNumber: '',
      pickUpTime: '',
      note: '',
      adl: 0,
      chd: 0,
      inf: 0,
      
      revenueDate: '',
      revenueRecNo: '',
      revenueEGP: 0,
      revenueUSD: 0,
      revenueEUR: 0,
      revenueGBP: 0,
      revenueFree: false,
      
      refundDate: '',
      refundRecNo: '',
      refundEGP: 0,
      refundUSD: 0,
      refundEUR: 0,
      refundGBP: 0,
      refundFree: false,
      
      discountEGP: 0,
      discountUSD: 0,
      discountEUR: 0,
      discountGBP: 0,
      discountFree: false,
      
      sellingEGP: 0,
      sellingUSD: 0,
      sellingEUR: 0,
      sellingGBP: 0,
      sellingFree: false,
      
      costEGP: 0,
      costUSD: 0,
      costEUR: 0,
      costGBP: 0,
      costFree: false,
      
      boatId: null,
      boatName: null,
      carTypeId: null,
      carTypeName: null,
      transportationSupplierId: null,
      transportationSupplierName: null,
      round: null,
      orderNumber: null,

      active: true,
      recordBy: ''
    };
  }
}
