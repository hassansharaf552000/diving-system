import Swal from 'sweetalert2';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { AccountingService } from '../../../../core/services/accounting.service';
import {
  TreasuryTransaction,
  TreasuryTransactionLine,
  TreasuryTransactionCreate,
  OperationAccount,
  CodePeriod,
  CodeBeneficiaryName,
  CodeCostCenter,
  CodeFileNumber
} from '../../../../core/interfaces/code.interfaces';

export interface TransactionTypeDef {
  id: number;
  name: string;
  prefix: string;
  /** Which side is allowed on lines: 'credit' | 'debit' | 'both' */
  lineRule: 'credit' | 'debit' | 'both';
  badgeClass: string;
}

@Component({
  selector: 'app-accounting-entry-treasury-transaction',
  standalone: false,
  templateUrl: './accounting-entry-treasury-transaction.component.html',
  styleUrl: './accounting-entry-treasury-transaction.component.scss'
})
export class AccountingEntryTreasuryTransactionComponent implements OnInit {

  // Five distinct transaction types matching the reference UI
  transactionTypes: TransactionTypeDef[] = [
    { id: 1, name: 'Revenue', prefix: 'REV', lineRule: 'credit', badgeClass: 'type-1' },
    { id: 2, name: 'Expense', prefix: 'EXP', lineRule: 'debit', badgeClass: 'type-2' },
    { id: 3, name: 'Advance', prefix: 'ADV', lineRule: 'debit', badgeClass: 'type-3' },
    { id: 4, name: 'Advance Settlement', prefix: 'ADS', lineRule: 'credit', badgeClass: 'type-4' },
    { id: 5, name: 'Due', prefix: 'DUE', lineRule: 'both', badgeClass: 'type-5' },
  ];

  currencies: string[] = ['EGP', 'USD', 'EUR', 'GBP'];
  paymentTypes: string[] = ['Cash', 'Check', 'Transfer', 'Credit Card'];

  currencyOptions = this.currencies.map(c => ({ id: c, label: c }));
  paymentTypeOptions = this.paymentTypes.map(p => ({ id: p, label: p }));

  // Search filters
  searchTerm = '';
  searchFromDate = '';
  searchToDate = '';
  searchTypeId: number | null = null;

  // Data
  transactions: TreasuryTransaction[] = [];
  selectedTransaction: TreasuryTransaction | null = null;

  // Dropdown data
  accounts: OperationAccount[] = [];
  periods: CodePeriod[] = [];
  beneficiaryNames: CodeBeneficiaryName[] = [];
  costCenters: CodeCostCenter[] = [];
  fileNumbers: CodeFileNumber[] = [];

  // Inline state
  isAdding = false;
  editingTransactionId: number | null | undefined = null;
  saving = false;

  private auth = inject(AuthService);

  // Header model
  model: TreasuryTransaction = this.emptyModel();

  // Currently selected type tab (for Add modal)
  selectedTypeDef: TransactionTypeDef = this.transactionTypes[0];

  // Auto-generated receipt number displayed in the modal
  generatedReceiptNo = '';


  // Line being added/edited (inline now)
  editingLineIndex = -1;
  lineModel: TreasuryTransactionLine = this.emptyLine();

  // Lines for the current transaction (add/edit)
  lines: TreasuryTransactionLine[] = [];

  // Delete dialog
  showDeleteConfirm = false;
  deleteTarget: TreasuryTransaction | null = null;

  // Stamp dialog
  showStampModal = false;
  stampTarget: TreasuryTransaction | null = null;
  stampStatuses: { value: string; text: string }[] = [];
  selectedStampStatus = '';
  stampingSaving = false;

  // Allowed stamp statuses to display
  private readonly allowedStampStatuses = ['Reviewed', 'Rejected', 'Cancelled'];

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.searchFromDate = new Date().toISOString().split('T')[0];
    this.searchToDate = new Date().toISOString().split('T')[0];
    this.loadDropdowns();
    this.loadStampStatuses();
    this.searchTransactions();
  }

  // ============ DROPDOWN LOADING ============
  loadDropdowns(): void {
    forkJoin({
      accounts: this.svc.getAllAccountsFlat(),
      periods: this.svc.getCodePeriods(),
      beneficiaryNames: this.svc.getCodeBeneficiaryNames(),
      costCenters: this.svc.getCodeCostCenters(),
      fileNumbers: this.svc.getCodeFileNumbers()
    }).subscribe({
      next: (data) => {
        this.accounts = data.accounts.map((a: any) => ({
          ...a,
          displayLabel: a.accountName
        }));
        this.periods = [
          { periodId: 0, periodName: '-', active: true },
          ...data.periods
        ];
        this.beneficiaryNames = data.beneficiaryNames;
        this.costCenters = data.costCenters;
        this.fileNumbers = [
          { fileId: 0, fileNumber: '-', fileName: '-', displayLabel: '-', active: true },
          ...data.fileNumbers.map((f: any) => ({
            ...f,
            displayLabel: `${f.fileNumber} - ${f.fileName}`
          }))
        ];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading dropdowns:', err)
    });
  }

  // ============ SEARCH ============
  searchTransactions(): void {
    this.svc.searchTreasuryTransactions(
      this.searchTerm || undefined,
      this.searchFromDate || undefined,
      this.searchToDate || undefined,
      this.searchTypeId ?? undefined
    ).subscribe({
      next: (data) => {
        this.transactions = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error searching transactions:', err)
    });
  }

  // ============ SELECT / LOAD ============
  selectTransaction(tx: TreasuryTransaction): void {
    if (tx.treasuryTransactionId) {
      this.svc.getTreasuryTransaction(tx.treasuryTransactionId).subscribe({
        next: (full) => {
          this.selectedTransaction = full;
          this.lines = full.lines ? full.lines.map(l => ({ ...l })) : [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading transaction:', err)
      });
    }
  }

  // ============ TYPE TAB SELECTION ============
  selectTypeDef(typeDef: TransactionTypeDef): void {
    this.selectedTypeDef = typeDef;
    this.model.transactionTypeId = typeDef.id;
    this.model.transactionTypeName = typeDef.name;
    // Fetch the next receipt number from the API
    this.svc.getNextReceiptNo(typeDef.id).subscribe({
      next: (no) => {
        this.generatedReceiptNo = no;
        this.model.receiptNo = no;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching receipt no:', err)
    });
  }

  onTypeChange(): void {
    const def = this.transactionTypes.find(t => t.id === this.model.transactionTypeId);
    if (def) {
      this.selectTypeDef(def);
    }
  }

  // ============ CURRENCY / RATE ============
  onCurrencyOrDateChange(): void {
    if (!this.model.currency || !this.model.transactionDate) return;

    if (this.model.currency === 'EGP') {
      this.model.rate = 1;
      return;
    }

    this.svc.getRateByCurrency(this.model.currency, this.model.transactionDate).subscribe({
      next: (res) => {
        if (typeof res === 'number') {
          this.model.rate = res;
        } else if (res && typeof res.rateValue === 'number') {
          this.model.rate = res.rateValue;
        } else if (res && typeof res.rate === 'number') {
          this.model.rate = res.rate;
        } else if (res && typeof res.buyRate === 'number') {
          this.model.rate = res.buyRate;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching rate:', err);
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'warning' }).fire('Rate not found for selected date');
      }
    });
  }

  // ============ ADD NEW ============
  openAdd(): void {
    this.cancelInline();

    this.model = this.emptyModel();
    this.lines = [];
    // Default to first type (Revenue)
    this.selectedTypeDef = this.transactionTypes[0];
    this.model.transactionTypeId = this.selectedTypeDef.id;
    this.model.transactionTypeName = this.selectedTypeDef.name;
    // Default date and due date to today
    const today = new Date().toISOString().split('T')[0];
    this.model.transactionDate = today;
    this.model.dueDate = today;
    // Default account to 12
    this.model.paymentDefaultAccountId = 12;
    // Beneficiary Name: default to the "-" record in the list
    const dashBeneficiary = this.beneficiaryNames.find(b => b.beneficiaryName === '-');
    if (dashBeneficiary) {
      this.model.beneficiaryNameId = dashBeneficiary.beneficiaryId;
    }
    // Fetch next receipt number from API
    this.svc.getNextReceiptNo(this.selectedTypeDef.id).subscribe({
      next: (no) => {
        this.generatedReceiptNo = no;
        this.model.receiptNo = no;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching receipt no:', err)
    });

    // Initialize empty line form
    this.lineModel = this.emptyLine();
    this.applyTypeDefaults();

    this.isAdding = true;
  }

  // ============ EDIT ============
  openEdit(tx: TreasuryTransaction): void {
    this.cancelInline();

    if (tx.treasuryTransactionId) {
      this.svc.getTreasuryTransaction(tx.treasuryTransactionId).subscribe({
        next: (full) => {
          this.model = { ...full };
          // Match the type tab
          const matchedType = this.transactionTypes.find(
            t => t.id === full.transactionTypeId || t.name.toLowerCase() === full.transactionTypeName?.toLowerCase()
          );
          if (matchedType) {
            this.selectedTypeDef = matchedType;
            this.model.transactionTypeId = matchedType.id;
            this.model.transactionTypeName = matchedType.name;
          }
          this.generatedReceiptNo = full.receiptNo || '';
          this.lines = full.lines ? full.lines.map(l => ({ ...l })) : [];
          this.editingTransactionId = tx.treasuryTransactionId;

          // Clear line form
          this.lineModel = this.emptyLine();
          this.applyTypeDefaults();
          this.editingLineIndex = -1;

          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading transaction:', err)
      });
    }
  }

  cancelInline(): void {
    this.isAdding = false;
    this.editingTransactionId = null;
    this.saving = false;
    // Clear out form states when cancelling
    this.lines = [];
    this.cancelLineEdit();
  }

  // ============ SAVE ============
  save(): void {
    if (!this.selectedTypeDef) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Please select a Transaction Type');
      return;
    }
    if (!this.model.transactionDate) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Please select a Date');
      return;
    }
    if (this.lines.length === 0) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Please add at least one line');
      return;
    }

    if (this.selectedTypeDef.id === 5 && this.balanceDifference !== 0) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Difference must be exactly 0 to save a Due transaction');
      return;
    }

    this.saving = true;
    const payload: TreasuryTransactionCreate = {
      transactionTypeId: this.selectedTypeDef.id,
      receiptNo: this.model.receiptNo || this.generatedReceiptNo,
      transactionDate: this.model.transactionDate || new Date().toISOString(),
      periodId: this.model.periodId || 0,
      beneficiaryNameId: this.model.beneficiaryNameId || undefined,
      currency: this.model.currency || 'EGP',
      rate: this.model.rate || 1,
      dueDate: this.model.dueDate || undefined,
      withdrawBank: this.model.withdrawBank || undefined,
      paymentType: this.model.paymentType || 'Cash',
      paymentDefaultAccountId: this.selectedTypeDef.id === 5 ? (this.model.paymentDefaultAccountId || 12) : 12,
      autoBalance: this.model.autoBalance ?? true,
      description: this.model.description || '',
      recordBy: this.model.recordBy || '',
      lines: this.lines.map(l => ({
        accountId: l.accountId || 0,
        fileNumberId: l.fileNumberId || undefined,
        costCenterId: l.costCenterId || undefined,
        periodId: l.periodId || undefined,
        serviceId: l.serviceId || undefined,
        taxPercent: l.taxPercent || undefined,
        taxNo: l.taxNo || undefined,
        lineDescription: l.lineDescription || '',
        debit: l.debit || 0,
        credit: l.credit || 0
      }))
    };

    if (this.editingTransactionId && this.model.treasuryTransactionId) {
      this.svc.updateTreasuryTransaction(this.model.treasuryTransactionId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.cancelInline();
          this.searchTransactions();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.saving = false;
          console.error('Update error:', err);
          Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to update: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.svc.createTreasuryTransaction(payload).subscribe({
        next: () => {
          this.saving = false;
          this.cancelInline();
          this.searchTransactions();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.saving = false;
          console.error('Create error:', err);
          Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to create: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  // ============ DELETE ============
  confirmDelete(tx: TreasuryTransaction): void {
    this.deleteTarget = tx;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (this.deleteTarget?.treasuryTransactionId) {
      this.svc.deleteTreasuryTransaction(this.deleteTarget.treasuryTransactionId).subscribe({
        next: () => {
          if (this.selectedTransaction?.treasuryTransactionId === this.deleteTarget?.treasuryTransactionId) {
            this.selectedTransaction = null;
            this.lines = [];
          }
          this.searchTransactions();
        },
        error: (err) => { console.error('Delete error:', err); Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to delete'); }
      });
    }
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  // ============ HELPERS (role check) ============
  get isAdminOrSuperAdmin(): boolean {
    return this.auth.hasRole('Admin', 'SuperAdmin');
  }

  // ============ STAMP ============
  loadStampStatuses(): void {
    this.svc.getStampStatuses().subscribe({
      next: (data) => {
        this.stampStatuses = data.filter(s => this.allowedStampStatuses.includes(s.value));
      },
      error: (err) => console.error('Error loading stamp statuses:', err)
    });
  }

  openStamp(tx: TreasuryTransaction, event: Event): void {
    event.stopPropagation();
    this.stampTarget = tx;
    this.selectedStampStatus = tx.stampStatus || '';
    this.showStampModal = true;
    this.cdr.detectChanges();
  }

  closeStampModal(): void {
    this.showStampModal = false;
    this.stampTarget = null;
    this.selectedStampStatus = '';
    this.stampingSaving = false;
    this.cdr.detectChanges();
  }

  saveStamp(): void {
    if (!this.selectedStampStatus) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'warning' }).fire('⚠️ Please select a status');
      return;
    }
    if (!this.stampTarget?.treasuryTransactionId) return;

    this.stampingSaving = true;
    this.svc.stampTransaction(this.stampTarget.treasuryTransactionId, this.selectedStampStatus).subscribe({
      next: () => {
        this.stampingSaving = false;
        this.closeStampModal();
        this.searchTransactions();
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success' }).fire('✅ Stamp applied successfully');
      },
      error: (err) => {
        this.stampingSaving = false;
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'error' }).fire('Failed to stamp: ' + (err.error?.message || err.message));
      }
    });
  }

  removeStamp(tx: TreasuryTransaction, event: Event): void {
    event.stopPropagation();
    if (!tx.treasuryTransactionId) return;
    Swal.fire({
      title: 'Remove Stamp?',
      text: 'Are you sure you want to remove the stamp from this transaction?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Remove'
    }).then(result => {
      if (result.isConfirmed) {
        this.svc.removeStamp(tx.treasuryTransactionId!).subscribe({
          next: () => {
            this.searchTransactions();
            Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success' }).fire('✅ Stamp removed');
          },
          error: (err) => {
            Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'error' }).fire('Failed to remove stamp: ' + (err.error?.message || err.message));
          }
        });
      }
    });
  }

  // ============ INLINE LINE FORM ============
  editLine(line: TreasuryTransactionLine, index: number): void {
    this.lineModel = { ...line };
    this.editingLineIndex = index;
  }

  cancelLineEdit(): void {
    this.lineModel = this.emptyLine();
    this.applyTypeDefaults();
    this.editingLineIndex = -1;
  }

  /** Apply debit/credit constraints based on the selected transaction type */
  applyTypeDefaults(): void {
    // Both allowed under all circumstances now
  }

  /** Whether debit input should be disabled for this transaction type */
  get debitDisabled(): boolean {
    return false;
  }

  /** Whether credit input should be disabled for this transaction type */
  get creditDisabled(): boolean {
    return false;
  }

  /** Hint text shown below debit field */
  get debitHint(): string {
    return '✅ Debit allowed';
  }

  /** Hint text shown below credit field */
  get creditHint(): string {
    return '✅ Credit allowed';
  }

  saveLine(): void {
    if (!this.lineModel.accountId) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Please select an Account');
      return;
    }

    const debit = this.lineModel.debit || 0;
    const credit = this.lineModel.credit || 0;

    if (debit === 0 && credit === 0) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('⚠️ Debit or Credit must be > 0');
      return;
    }

    // Resolve display names
    const acc = this.accounts.find(a => a.id === this.lineModel.accountId);
    if (acc) this.lineModel.accountName = acc.accountName;

    const period = this.periods.find(p => p.periodId === this.lineModel.periodId);
    if (period) this.lineModel.periodName = period.periodName;

    const cc = this.costCenters.find(c => c.costCenterId === this.lineModel.costCenterId);
    if (cc) this.lineModel.costCenterName = cc.costCenterName;

    const fn = this.fileNumbers.find(f => f.fileId === this.lineModel.fileNumberId);
    if (fn) this.lineModel.fileNumberValue = fn.fileNumber;

    const rate = this.model.rate || 1;
    this.lineModel.eqDebit = debit * rate;
    this.lineModel.eqCredit = credit * rate;

    if (this.editingLineIndex >= 0) {
      this.lines[this.editingLineIndex] = { ...this.lineModel };
    } else {
      this.lines.push({ ...this.lineModel });
    }

    // Reset form
    this.lineModel = this.emptyLine();
    this.applyTypeDefaults();
    this.editingLineIndex = -1;
    this.cdr.detectChanges();
  }

  removeLine(index: number): void {
    this.lines.splice(index, 1);
    this.cdr.detectChanges();
  }

  pageSize = 10;
  currentPage = 1;
  get paginatedItems() { const start = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(start, start + this.pageSize); }
  onPageChange(page: number): void { this.currentPage = page; }
  onPageSizeChange(size: number): void { this.pageSize = size; this.currentPage = 1; }

  // ============ COMPUTED ============
  get filtered(): TreasuryTransaction[] {
    return this.transactions;
  }

  get totalDebit(): number {
    return this.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  }

  get totalCredit(): number {
    return this.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  }

  get balanceDifference(): number {
    return this.totalDebit - this.totalCredit;
  }

  get totalEqDebit(): number {
    return this.lines.reduce((sum, l) => sum + (l.eqDebit || 0), 0);
  }

  get totalEqCredit(): number {
    return this.lines.reduce((sum, l) => sum + (l.eqCredit || 0), 0);
  }

  getBadgeClass(tx: TreasuryTransaction): string {
    const typeDef = this.transactionTypes.find(
      t => t.id === tx.transactionTypeId || t.name === tx.transactionTypeName
    );
    return typeDef?.badgeClass || 'type-1';
  }

  // ============ PRINT ============
  printTransaction(tx: TreasuryTransaction): void {
    if (!tx.treasuryTransactionId) return;
    this.svc.printTreasuryTransaction(tx.treasuryTransactionId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
          win.focus();
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
      },
      error: (err) => {
        console.error('Print error:', err);
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to load print preview.');
      }
    });
  }

  // ============ NAVIGATION ============
  goBack(): void {
    this.router.navigate(['/accounting/entries']);
  }

  // ============ HELPERS ============
  private emptyModel(): TreasuryTransaction {
    const user = this.auth?.currentUser();
    const userName = user?.fullName || user?.userName || '';

    return {
      transactionTypeId: undefined,
      transactionTypeName: undefined,
      receiptNo: '',
      transactionDate: '',
      periodId: 0,
      beneficiaryNameId: undefined,
      currency: 'EGP',
      rate: 1,
      dueDate: '',
      withdrawBank: '',
      paymentType: 'Cash',
      paymentDefaultAccountId: 12,
      autoBalance: true,
      description: '',
      active: true,
      recordBy: userName,
      lines: []
    };
  }

  private emptyLine(): TreasuryTransactionLine {
    return {
      accountId: undefined,
      accountName: '',
      fileNumberId: 0,
      fileNumberValue: '',
      serviceId: undefined,
      costCenterId: undefined,
      costCenterName: '',
      periodId: 0,
      periodName: '',
      taxPercent: undefined,
      taxNo: '',
      lineDescription: '',
      debit: 0,
      credit: 0,
      eqDebit: 0,
      eqCredit: 0
    };
  }
}