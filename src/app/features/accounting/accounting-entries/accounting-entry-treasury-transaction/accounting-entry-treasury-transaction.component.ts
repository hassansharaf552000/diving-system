import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
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

  paymentTypes: string[] = ['Cash', 'Check', 'Transfer', 'Credit Card'];
  currencies: string[] = ['EGP', 'USD', 'EUR', 'GBP'];

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

  // Modal state
  isModalOpen = false;
  isEdit = false;
  saving = false;

  // Header model
  model: TreasuryTransaction = this.emptyModel();

  // Currently selected type tab (for Add modal)
  selectedTypeDef: TransactionTypeDef = this.transactionTypes[0];

  // Auto-generated receipt number displayed in the modal
  generatedReceiptNo = '';


  // Line being added/edited via modal
  isLineModalOpen = false;
  isLineEdit = false;
  editingLineIndex = -1;
  lineSaving = false;
  lineModel: TreasuryTransactionLine = this.emptyLine();

  // Lines for the current transaction (add/edit)
  lines: TreasuryTransactionLine[] = [];

  // Delete dialog
  showDeleteConfirm = false;
  deleteTarget: TreasuryTransaction | null = null;

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.searchFromDate = new Date().toISOString().split('T')[0];
    this.searchToDate = new Date().toISOString().split('T')[0];
    this.loadDropdowns();
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
          displayLabel: `${a.accountNumber} - ${a.accountName}`
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
    this.generatedReceiptNo = this.buildReceiptNo(typeDef.prefix);
    this.model.receiptNo = this.generatedReceiptNo;
  }

  private buildReceiptNo(prefix: string): string {
    // Scan existing transactions for this prefix and find the highest sequence number
    let maxNo = 0;
    const pattern = new RegExp(`^${prefix}-(\\d+)$`, 'i');
    for (const tx of this.transactions) {
      const match = tx.receiptNo?.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNo) maxNo = num;
      }
    }
    return `${prefix}-${String(maxNo + 1).padStart(3, '0')}`;
  }

  // ============ ADD NEW ============
  openAdd(): void {
    this.model = this.emptyModel();
    this.lines = [];
    this.isEdit = false;
    // Default to first type (Revenue)
    this.selectedTypeDef = this.transactionTypes[0];
    this.model.transactionTypeId = this.selectedTypeDef.id;
    this.model.transactionTypeName = this.selectedTypeDef.name;
    this.generatedReceiptNo = this.buildReceiptNo(this.selectedTypeDef.prefix);
    this.model.receiptNo = this.generatedReceiptNo;
    // Default date and due date to today
    const today = new Date().toISOString().split('T')[0];
    this.model.transactionDate = today;
    this.model.dueDate = today;
    // Default account: 102010001 (نقدية بالصندوق)
    const defaultAccount = this.accounts.find(a => a.accountNumber === '102010001');
    if (defaultAccount) {
      this.model.paymentDefaultAccountId = defaultAccount.id;
    }
    // Beneficiary Name: default to the "-" record in the list
    const dashBeneficiary = this.beneficiaryNames.find(b => b.beneficiaryName === '-');
    if (dashBeneficiary) {
      this.model.beneficiaryNameId = dashBeneficiary.beneficiaryId;
    }
    this.isModalOpen = true;
  }

  // ============ EDIT ============
  openEdit(tx: TreasuryTransaction): void {
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
          this.isEdit = true;
          this.isModalOpen = true;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading transaction:', err)
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saving = false;
  }

  // ============ SAVE ============
  save(): void {
    if (!this.selectedTypeDef) {
      alert('⚠️ Please select a Transaction Type');
      return;
    }
    if (!this.model.transactionDate) {
      alert('⚠️ Please select a Date');
      return;
    }
    if (this.lines.length === 0) {
      alert('⚠️ Please add at least one line');
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
      paymentDefaultAccountId: this.model.paymentDefaultAccountId || 0,
      recordBy: this.model.recordBy || '',
      // Pass all lines — use first line for manual line fields
      manualLineAccountId: this.lines[0]?.accountId || 0,
      manualLineFileNumberId: this.lines[0]?.fileNumberId || undefined,
      manualLineCostCenterId: this.lines[0]?.costCenterId || undefined,
      manualLinePeriodId: this.lines[0]?.periodId || undefined,
      manualLineServiceId: this.lines[0]?.serviceId || undefined,
      manualLineTaxPercent: this.lines[0]?.taxPercent || undefined,
      manualLineTaxNo: this.lines[0]?.taxNo || undefined,
      manualLineDescription: this.lines[0]?.lineDescription || '',
      manualLineDebit: this.lines[0]?.debit || 0,
      manualLineCredit: this.lines[0]?.credit || 0
    };

    if (this.isEdit && this.model.treasuryTransactionId) {
      this.svc.updateTreasuryTransaction(this.model.treasuryTransactionId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.searchTransactions();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.saving = false;
          console.error('Update error:', err);
          alert('Failed to update: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.svc.createTreasuryTransaction(payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.searchTransactions();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.saving = false;
          console.error('Create error:', err);
          alert('Failed to create: ' + (err.error?.message || err.message));
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
        error: (err) => { console.error('Delete error:', err); alert('Failed to delete'); }
      });
    }
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  // ============ LINE MODAL ============
  openAddLine(): void {
    this.lineModel = this.emptyLine();
    this.applyTypeDefaults();
    this.isLineEdit = false;
    this.editingLineIndex = -1;
    this.isLineModalOpen = true;
  }

  openEditLine(line: TreasuryTransactionLine, index: number): void {
    this.lineModel = { ...line };
    this.isLineEdit = true;
    this.editingLineIndex = index;
    this.isLineModalOpen = true;
  }

  closeLineModal(): void {
    this.isLineModalOpen = false;
    this.isLineEdit = false;
    this.editingLineIndex = -1;
    this.lineSaving = false;
  }

  /** Apply debit/credit constraints based on the selected transaction type */
  applyTypeDefaults(): void {
    const rule = this.selectedTypeDef?.lineRule || 'both';
    if (rule === 'credit') {
      this.lineModel.debit = 0;
    } else if (rule === 'debit') {
      this.lineModel.credit = 0;
    }
  }

  /** Whether debit input should be disabled for this transaction type */
  get debitDisabled(): boolean {
    return this.selectedTypeDef?.lineRule === 'credit';
  }

  /** Whether credit input should be disabled for this transaction type */
  get creditDisabled(): boolean {
    return this.selectedTypeDef?.lineRule === 'debit';
  }

  /** Hint text shown below debit field */
  get debitHint(): string {
    const rule = this.selectedTypeDef?.lineRule;
    if (rule === 'credit') return '🚫 Not allowed for this type';
    return '✅ Debit allowed';
  }

  /** Hint text shown below credit field */
  get creditHint(): string {
    const rule = this.selectedTypeDef?.lineRule;
    if (rule === 'debit') return '🚫 Not allowed for this type';
    return '✅ Credit allowed';
  }

  saveLine(): void {
    if (!this.lineModel.accountId) {
      alert('⚠️ Please select an Account');
      return;
    }

    const rule = this.selectedTypeDef?.lineRule || 'both';
    const debit = this.lineModel.debit || 0;
    const credit = this.lineModel.credit || 0;

    if (debit === 0 && credit === 0) {
      alert('⚠️ Debit or Credit must be > 0');
      return;
    }
    if (rule === 'credit' && debit > 0) {
      alert('⚠️ Only Credit is allowed for ' + this.selectedTypeDef.name);
      return;
    }
    if (rule === 'debit' && credit > 0) {
      alert('⚠️ Only Debit is allowed for ' + this.selectedTypeDef.name);
      return;
    }
    if (debit > 0 && credit > 0) {
      alert('⚠️ Cannot have both Debit and Credit > 0 on the same line');
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

    if (this.isLineEdit && this.editingLineIndex >= 0) {
      this.lines[this.editingLineIndex] = { ...this.lineModel };
    } else {
      this.lines.push({ ...this.lineModel });
    }
    this.closeLineModal();
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

  // ============ NAVIGATION ============
  goBack(): void {
    this.router.navigate(['/accounting/entries']);
  }

  // ============ HELPERS ============
  private emptyModel(): TreasuryTransaction {
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
      paymentDefaultAccountId: undefined,
      active: true,
      recordBy: '',
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