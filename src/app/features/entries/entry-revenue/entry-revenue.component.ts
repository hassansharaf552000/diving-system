import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  EntryRevenueRow, EntryRevenueTotals,
  Excursion, PriceList, Agent, Hotel, Rep
} from '../../../core/interfaces/code.interfaces';
import { CodeService } from '../../../core/services/code.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-entry-revenue',
  standalone: false,
  templateUrl: './entry-revenue.component.html',
  styleUrl: './entry-revenue.component.scss'
})
export class EntryRevenueComponent implements OnInit {

  // Filter Models
  filters = {
    fromDate: '',
    toDate: '',
    fromVoucher: undefined as number | undefined,
    toVoucher: undefined as number | undefined,
    repId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    hotelId: undefined as number | undefined,
    excursionId: undefined as number | undefined,
    isPaid: undefined as boolean | undefined
  };

  // Dropdown Lists
  reps: Rep[] = [];
  agents: Agent[] = [];
  hotels: Hotel[] = [];
  excursions: Excursion[] = [];
  priceLists: PriceList[] = [];

  // Data
  revenueData: EntryRevenueRow[] = [];
  totals: EntryRevenueTotals = {};
  loading = false;

  // Payment Panel
  selectedRow: EntryRevenueRow | null = null;
  paymentDate: string = '';
  paymentRecNo: string = '';
  paymentLoading = false;

  showUpdateConfirm = false;
  showDeleteConfirm = false;

  constructor(
    private codeService: CodeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadDropdowns();
    this.viewRevenue();
  }

  setDefaultDates() {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    this.filters.fromDate = formatted;
    this.filters.toDate = formatted;
    this.paymentDate = formatted;
  }

  loadDropdowns() {
    this.loading = true;
    forkJoin({
      reps: this.codeService.getReps(),
      agents: this.codeService.getAgents(),
      hotels: this.codeService.getHotels(),
      excursions: this.codeService.getExcursions(),
      priceLists: this.codeService.getPriceLists()
    }).subscribe({
      next: (res) => {
        this.reps = res.reps;
        this.agents = res.agents;
        this.hotels = res.hotels;
        this.excursions = res.excursions;
        this.priceLists = res.priceLists;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dropdowns', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewRevenue() {
    this.loading = true;
    this.selectedRow = null; // reset selection
    this.codeService.getEntryRevenue(this.filters).subscribe({
      next: (res: any) => {
        this.revenueData = res?.rows || res || [];
        this.totals = res?.totals || {};
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching revenue data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearFilter() {
    this.filters = {
      fromDate: '',
      toDate: '',
      fromVoucher: undefined,
      toVoucher: undefined,
      repId: undefined,
      agentId: undefined,
      hotelId: undefined,
      excursionId: undefined,
      isPaid: undefined
    };
    this.setDefaultDates();
    this.revenueData = [];
    this.totals = {};
    this.selectedRow = null;
    this.cdr.detectChanges();
  }

  selectRow(row: EntryRevenueRow) {
    this.selectedRow = row;
    if (row.paymentDate) {
      this.paymentDate = row.paymentDate.split('T')[0];
    } else {
      const today = new Date();
      this.paymentDate = today.toISOString().split('T')[0];
    }
    this.paymentRecNo = row.paymentRecNo || '';
  }

  pay() {
    if (!this.selectedRow || !this.selectedRow.entryTransactionId) return;
    if (!this.paymentDate) {
      this.toastService.warning('Payment Date is required');
      return;
    }

    const payload = {
      paymentDate: this.paymentDate,
      paymentRecNo: this.paymentRecNo
    };

    this.paymentLoading = true;
    this.codeService.payEntryRevenue(this.selectedRow.entryTransactionId, payload).subscribe({
      next: () => {
        this.paymentLoading = false;
        this.toastService.success('Paid successfully');
        this.viewRevenue(); // reload grid
      },
      error: (err) => {
        this.paymentLoading = false;
        console.error('Pay error:', err);
        this.toastService.error('Failed to pay');
      }
    });
  }

  updatePay() {
    if (!this.selectedRow || !this.selectedRow.entryTransactionId) return;
    if (!this.paymentDate) {
      this.toastService.warning('Payment Date is required');
      return;
    }
    
    this.showUpdateConfirm = true;
  }

  onUpdateConfirmed() {
    if (!this.selectedRow || !this.selectedRow.entryTransactionId) return;
    
    const payload = {
      paymentDate: this.paymentDate,
      paymentRecNo: this.paymentRecNo
    };

    this.paymentLoading = true;
    this.showUpdateConfirm = false;
    this.codeService.updatePayEntryRevenue(this.selectedRow.entryTransactionId, payload).subscribe({
      next: () => {
        this.paymentLoading = false;
        this.toastService.success('Payment updated successfully');
        this.viewRevenue();
      },
      error: (err) => {
        this.paymentLoading = false;
        console.error('Update pay error:', err);
        this.toastService.error('Failed to update payment');
      }
    });
  }

  deletePay() {
    if (!this.selectedRow || !this.selectedRow.entryTransactionId) return;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed() {
    if (!this.selectedRow || !this.selectedRow.entryTransactionId) return;

    this.paymentLoading = true;
    this.showDeleteConfirm = false;
    this.codeService.deletePayEntryRevenue(this.selectedRow.entryTransactionId, {}).subscribe({
      next: () => {
        this.paymentLoading = false;
        this.toastService.success('Payment deleted successfully');
        this.viewRevenue();
      },
      error: (err) => {
        this.paymentLoading = false;
        console.error('Delete pay error:', err);
        this.toastService.error('Failed to delete payment');
      }
    });
  }
}
