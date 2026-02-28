import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  EntryTransaction, Rep, Agent, Nationality, Hotel, HotelDestination,
  Excursion, ExcursionSupplier, PriceList
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
  paymentTypes: string[] = ['Cash', 'Credit', 'FOC'];

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
      priceLists: this.svc.getPriceLists()
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
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading dropdowns:', err)
    });
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
      
      active: true,
      recordBy: ''
    };
  }
}
