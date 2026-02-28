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
  CodeBeneficiaryType,
  CodeCostCenter,
  CodeFileNumber
} from '../../../../core/interfaces/code.interfaces';

interface TransactionType {
  id: number;
  name: string;
}

@Component({
  selector: 'app-accounting-entry-treasury-transaction',
  standalone: false,
  templateUrl: './accounting-entry-treasury-transaction.component.html',
  styleUrl: './accounting-entry-treasury-transaction.component.scss'
})
export class AccountingEntryTreasuryTransactionComponent implements OnInit {

  // Transaction type names mapped to IDs for sending to backend
  transactionTypes = [
    { name: 'Advance', id: 2 },
    { name: 'Revenue', id: 1 },
    { name: 'Expense', id: 2 },
    { name: 'Advance Settlement', id: 1 }
  ];

  paymentTypes: string[] = ['Cash', 'Check', 'Transfer', 'Credit Card'];
  currencies: string[] = ['EGP', 'USD', 'EUR', 'GBP'];

  // Search filters
  searchTerm = '';
  searchFromDate = '';
  searchToDate = '';
  searchTypeName: string | null = null;

  // Data
  transactions: TreasuryTransaction[] = [];
  selectedTransaction: TreasuryTransaction | null = null;

  // Dropdown data
  accounts: OperationAccount[] = [];
  periods: CodePeriod[] = [];
  beneficiaryNames: CodeBeneficiaryName[] = [];
  beneficiaryTypes: CodeBeneficiaryType[] = [];
  costCenters: CodeCostCenter[] = [];
  fileNumbers: CodeFileNumber[] = [];

  // Modal state
  isModalOpen = false;
  isEdit = false;
  saving = false;

  // Header model
  model: TreasuryTransaction = this.emptyModel();

  // Line being added/edited via modal
  isLineModalOpen = false;
  isLineEdit = false;
  editingLineIndex = -1;
  lineSaving = false;
  lineModel: TreasuryTransactionLine = this.emptyLine();

  // Lines for the selected transaction
  lines: TreasuryTransactionLine[] = [];

  // Delete dialog
  showDeleteConfirm = false;
  deleteTarget: TreasuryTransaction | null = null;

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.searchTransactions();
  }

  // ============ DROPDOWN LOADING ============
  loadDropdowns(): void {
    forkJoin({
      accounts: this.svc.getRootAccounts(),
      periods: this.svc.getCodePeriods(),
      beneficiaryNames: this.svc.getCodeBeneficiaryNames(),
      beneficiaryTypes: this.svc.getCodeBeneficiaryTypes(),
      costCenters: this.svc.getCodeCostCenters(),
      fileNumbers: this.svc.getCodeFileNumbers()
    }).subscribe({
      next: (data) => {
        this.accounts = data.accounts;
        this.periods = data.periods;
        this.beneficiaryNames = data.beneficiaryNames;
        this.beneficiaryTypes = data.beneficiaryTypes;
        this.costCenters = data.costCenters;
        this.fileNumbers = data.fileNumbers;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading dropdowns:', err)
    });
  }

  // ============ SEARCH ============
  searchTransactions(): void {
    const selectedType = this.transactionTypes.find(t => t.name === this.searchTypeName);
    const searchTypeId = selectedType ? selectedType.id : undefined;

    this.svc.searchTreasuryTransactions(
      this.searchTerm || undefined,
      this.searchFromDate || undefined,
      this.searchToDate || undefined,
      searchTypeId
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
          this.model = { ...full };
          this.lines = full.lines ? full.lines.map(l => ({ ...l })) : [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading transaction:', err)
      });
    }
  }

  // ============ ADD NEW ============
  openAdd(): void {
    this.model = this.emptyModel();
    this.lines = [];
    this.isEdit = false;
    this.isModalOpen = true;
  }

  // ============ EDIT ============
  openEdit(tx: TreasuryTransaction): void {
    if (tx.treasuryTransactionId) {
      this.svc.getTreasuryTransaction(tx.treasuryTransactionId).subscribe({
        next: (full) => {
          this.model = { ...full };
          // Ensure transactionTypeName is matched properly for the dropdown if backend returns something slightly different
          const matchedType = this.transactionTypes.find(t => t.name.toLowerCase() === full.transactionTypeName?.toLowerCase());
          if (matchedType) this.model.transactionTypeName = matchedType.name;

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
    const selectedType = this.transactionTypes.find(t => t.name === this.model.transactionTypeName);
    if (!selectedType) {
      alert('⚠️ Please select a valid Transaction Type');
      return;
    }
    
    this.model.transactionTypeId = selectedType.id;

    if (!this.model.receiptNo) {
      alert('⚠️ Please enter a Receipt No');
      return;
    }
    if (this.lines.length === 0) {
      alert('⚠️ Please add at least one line');
      return;
    }
    const firstLine = this.lines[0];
    if ((firstLine.debit || 0) <= 0 && (firstLine.credit || 0) <= 0) {
      alert('⚠️ Manual line must have either Debit or Credit > 0');
      return;
    }

    this.saving = true;
    const payload: TreasuryTransactionCreate = {
      transactionTypeId: this.model.transactionTypeId,
      receiptNo: this.model.receiptNo || '',
      transactionDate: this.model.transactionDate || new Date().toISOString(),
      periodId: this.model.periodId || 0,
      beneficiaryNameId: this.model.beneficiaryNameId || undefined,
      beneficiaryTypeId: this.model.beneficiaryTypeId || undefined,
      currency: this.model.currency || 'EGP',
      rate: this.model.rate || 1,
      dueDate: this.model.dueDate || undefined,
      withdrawBank: this.model.withdrawBank || undefined,
      paymentType: this.model.paymentType || 'Cash',
      paymentDefaultAccountId: this.model.paymentDefaultAccountId || 0,
      description: this.model.description || '',
      recordBy: this.model.recordBy || '',
      // Manual line fields from the first line
      manualLineAccountId: firstLine.accountId || 0,
      manualLineFileNumberId: firstLine.fileNumberId || undefined,
      manualLineCostCenterId: firstLine.costCenterId || undefined,
      manualLinePeriodId: firstLine.periodId || undefined,
      manualLineServiceId: firstLine.serviceId || undefined,
      manualLineTaxPercent: firstLine.taxPercent || undefined,
      manualLineTaxNo: firstLine.taxNo || undefined,
      manualLineDescription: firstLine.lineDescription || '',
      manualLineDebit: firstLine.debit || 0,
      manualLineCredit: firstLine.credit || 0
    };

    if (this.isEdit && this.model.treasuryTransactionId) {
      this.svc.updateTreasuryTransaction(this.model.treasuryTransactionId, payload).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.searchTransactions(); this.cdr.detectChanges(); },
        error: (err) => { this.saving = false; console.error('Update error:', err); alert('Failed to update: ' + (err.error?.message || err.message)); }
      });
    } else {
      this.svc.createTreasuryTransaction(payload).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.searchTransactions(); this.cdr.detectChanges(); },
        error: (err) => { this.saving = false; console.error('Create error:', err); alert('Failed to create: ' + (err.error?.message || err.message)); }
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

  saveLine(): void {
    if (!this.lineModel.accountId) {
      alert('⚠️ Please select an Account');
      return;
    }

    const acc = this.accounts.find(a => a.id === this.lineModel.accountId);
    if (acc) this.lineModel.accountName = acc.accountName;

    const period = this.periods.find(p => p.periodId === this.lineModel.periodId);
    if (period) this.lineModel.periodName = period.periodName;

    const cc = this.costCenters.find(c => c.costCenterId === this.lineModel.costCenterId);
    if (cc) this.lineModel.costCenterName = cc.costCenterName;

    const fn = this.fileNumbers.find(f => f.fileId === this.lineModel.fileNumberId);
    if (fn) this.lineModel.fileNumberValue = fn.fileNumber;

    const rate = this.model.rate || 1;
    this.lineModel.eqDebit = this.lineModel.debit * rate;
    this.lineModel.eqCredit = this.lineModel.credit * rate;

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

  getTransactionTypeName(id?: number): string {
    if (!id) return '';
    return this.transactionTypes.find(t => t.id === id)?.name || '';
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
      periodId: undefined,
      beneficiaryNameId: undefined,
      beneficiaryTypeId: undefined,
      currency: 'EGP',
      rate: 1,
      dueDate: '',
      withdrawBank: '',
      paymentType: 'Cash',
      paymentDefaultAccountId: undefined,
      description: '',
      active: true,
      recordBy: '',
      lines: []
    };
  }

  private emptyLine(): TreasuryTransactionLine {
    return {
      accountId: undefined,
      accountName: '',
      fileNumberId: undefined,
      fileNumberValue: '',
      serviceId: undefined,
      costCenterId: undefined,
      costCenterName: '',
      periodId: undefined,
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