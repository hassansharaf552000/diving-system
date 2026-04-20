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

  // Bulk Panel
  selectedIds: number[] = [];

  showUpdateConfirm = false;
  showDeleteConfirm = false;
  showBulkDeleteConfirm = false;

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

  pageSize = 10;
  currentPage = 1;
  get paginatedRevenueData() { const start = (this.currentPage - 1) * this.pageSize; return this.revenueData.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }

  viewRevenue() {
    this.loading = true;
    this.currentPage = 1;
    this.selectedRow = null; // reset selection
    this.selectedIds = [];
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

  onRepChange(repId: number | undefined): void {
    if (repId) {
      const rep = this.reps.find(r => r.id === repId);
      if (rep?.agentId) {
        this.filters.agentId = rep.agentId;
      }
    } else {
      this.filters.agentId = undefined;
    }
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
    this.selectedIds = [];
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

  toggleSelection(row: EntryRevenueRow, event: any) {
    if (event.target.checked) {
      if (row.entryTransactionId && !this.selectedIds.includes(row.entryTransactionId)) {
        this.selectedIds.push(row.entryTransactionId);
      }
    } else {
      this.selectedIds = this.selectedIds.filter(id => id !== row.entryTransactionId);
    }
    this.updatePaymentDefault();
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.selectedIds = this.paginatedRevenueData
        .map(r => r.entryTransactionId)
        .filter((id): id is number => id !== undefined);
    } else {
      this.selectedIds = [];
    }
    this.updatePaymentDefault();
  }

  isAllSelected() {
    const ids = this.paginatedRevenueData
      .map(r => r.entryTransactionId)
      .filter((id): id is number => id !== undefined);
    return ids.length > 0 && ids.every(id => this.selectedIds.includes(id));
  }

  isSelected(row: EntryRevenueRow) {
    return row.entryTransactionId ? this.selectedIds.includes(row.entryTransactionId) : false;
  }

  updatePaymentDefault() {
    if (this.selectedIds.length > 0) {
      const today = new Date();
      this.paymentDate = today.toISOString().split('T')[0];
    }
  }

  bulkPay() {
    if (this.selectedIds.length === 0) return;
    if (!this.paymentDate) {
      this.toastService.warning('Payment Date is required');
      return;
    }

    const payload = {
      entryTransactionIds: this.selectedIds,
      paymentDate: this.paymentDate,
      paymentRecNo: this.paymentRecNo
    };

    this.paymentLoading = true;
    this.codeService.bulkPayEntryRevenue(payload).subscribe({
      next: () => {
        this.paymentLoading = false;
        this.toastService.success('Bulk Payment successful');
        this.selectedIds = [];
        this.viewRevenue(); 
      },
      error: (err) => {
        this.paymentLoading = false;
        console.error('Bulk Pay error:', err);
        this.toastService.error('Failed to bulk pay');
      }
    });
  }

  bulkDeletePay() {
    if (this.selectedIds.length === 0) return;
    this.showBulkDeleteConfirm = true;
  }

  onBulkDeleteConfirmed() {
    if (this.selectedIds.length === 0) return;

    const payload = {
      entryTransactionIds: this.selectedIds
    };

    this.paymentLoading = true;
    this.showBulkDeleteConfirm = false;
    this.codeService.bulkDeletePayEntryRevenue(payload).subscribe({
      next: () => {
        this.paymentLoading = false;
        this.toastService.success('Bulk Delete Payment successful');
        this.selectedIds = [];
        this.viewRevenue(); 
      },
      error: (err) => {
        this.paymentLoading = false;
        console.error('Bulk Delete Pay error:', err);
        this.toastService.error('Failed to bulk delete payment');
      }
    });
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
