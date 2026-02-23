import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService } from '../../../../core/services/accounting.service';
import { OperationAccount, OperationAccountCreate } from '../../../../core/interfaces/code.interfaces';

@Component({
  selector: 'app-accounting-code-account',
  standalone: false,
  templateUrl: './accounting-code-account.component.html',
  styleUrl: './accounting-code-account.component.scss'
})
export class AccountingCodeAccountComponent implements OnInit {
  items: OperationAccount[] = [];
  flatList: OperationAccount[] = [];
  saving = false;
  isModalOpen = false;
  isEdit = false;
  searchTerm = '';
  searchResults: OperationAccount[] = [];
  isSearching = false;
  showDeleteConfirm = false;
  deleteTarget: OperationAccount | null = null;

  // Form model
  model: {
    id?: number;
    accountNumber: string;
    accountName: string;
    parentId: number | null;
    isActive: boolean;
  } = { accountNumber: '', accountName: '', parentId: null, isActive: true };

  // Track which parent to add child under
  addingChildOf: OperationAccount | null = null;

  constructor(
    private svc: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRoots();
  }

  loadRoots(): void {
    this.svc.getRootAccounts().subscribe({
      next: (data) => {
        this.items = data.map(item => ({ ...item, expanded: false, childrenLoaded: false, children: [] }));
        this.rebuildFlatList();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading root accounts:', err)
    });
  }

  toggleExpand(item: OperationAccount): void {
    if (item.expanded) {
      item.expanded = false;
      this.rebuildFlatList();
      this.cdr.detectChanges();
      return;
    }

    if (item.childrenLoaded) {
      item.expanded = true;
      this.rebuildFlatList();
      this.cdr.detectChanges();
      return;
    }

    // Lazy load children
    this.svc.getChildAccounts(item.id).subscribe({
      next: (children) => {
        item.children = children.map(c => ({ ...c, expanded: false, childrenLoaded: false, children: [] }));
        item.childrenLoaded = true;
        item.hasChildren = children.length > 0;
        item.expanded = true;
        this.rebuildFlatList();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading children:', err)
    });
  }

  rebuildFlatList(): void {
    this.flatList = [];
    this.flattenTree(this.items);
  }

  private flattenTree(accounts: OperationAccount[]): void {
    for (const account of accounts) {
      this.flatList.push(account);
      if (account.expanded && account.children && account.children.length > 0) {
        this.flattenTree(account.children);
      }
    }
  }

  get displayList(): OperationAccount[] {
    if (this.isSearching && this.searchTerm) {
      return this.searchResults;
    }
    return this.flatList;
  }

  get totalCount(): number {
    return this.isSearching ? this.searchResults.length : this.countAll(this.items);
  }

  private countAll(accounts: OperationAccount[]): number {
    let count = accounts.length;
    for (const a of accounts) {
      if (a.children) count += this.countAll(a.children);
    }
    return count;
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.isSearching = false;
      this.searchResults = [];
      this.cdr.detectChanges();
      return;
    }
    this.isSearching = true;
    this.svc.searchAccounts(this.searchTerm.trim()).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Search error:', err)
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.searchResults = [];
    this.cdr.detectChanges();
  }

  // ---- Add / Edit ----
  openAddRoot(): void {
    this.model = { accountNumber: '', accountName: '', parentId: null, isActive: true };
    this.addingChildOf = null;
    this.isEdit = false;
    this.isModalOpen = true;
  }

  openAddChild(parent: OperationAccount): void {
    this.model = { accountNumber: '', accountName: '', parentId: parent.id, isActive: true };
    this.addingChildOf = parent;
    this.isEdit = false;
    this.isModalOpen = true;
  }

  openEdit(item: OperationAccount): void {
    this.model = {
      id: item.id,
      accountNumber: item.accountNumber,
      accountName: item.accountName,
      parentId: item.parentId,
      isActive: item.isActive
    };
    this.isEdit = true;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saving = false;
    this.addingChildOf = null;
  }

  save(): void {
    if (!this.model.accountName || !this.model.accountNumber) {
      alert('⚠️ Please fill in Account Number and Account Name');
      return;
    }

    this.saving = true;

    if (this.isEdit && this.model.id) {
      this.svc.updateAccount(this.model.id, {
        accountNumber: this.model.accountNumber,
        accountName: this.model.accountName,
        isActive: this.model.isActive
      } as any).subscribe({
        next: () => {
          this.saving = false;
          this.refreshAfterChange();
          this.closeModal();
        },
        error: (err) => { this.saving = false; console.error('Update error:', err); alert('Failed to update account'); }
      });
    } else {
      const createData: OperationAccountCreate = {
        accountNumber: this.model.accountNumber,
        accountName: this.model.accountName,
        parentId: this.model.parentId,
        isActive: this.model.isActive,
        createdBy: 'admin'
      };
      this.svc.createAccount(createData).subscribe({
        next: () => {
          this.saving = false;
          this.refreshAfterChange();
          this.closeModal();
        },
        error: (err) => { this.saving = false; console.error('Create error:', err); alert('Failed to create account'); }
      });
    }
  }

  private refreshAfterChange(): void {
    if (this.addingChildOf) {
      // Reload children of the parent
      const parent = this.addingChildOf;
      this.svc.getChildAccounts(parent.id).subscribe({
        next: (children) => {
          parent.children = children.map(c => ({ ...c, expanded: false, childrenLoaded: false, children: [] }));
          parent.childrenLoaded = true;
          parent.hasChildren = children.length > 0;
          parent.expanded = true;
          this.rebuildFlatList();
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loadRoots();
    }
  }

  // ---- Delete ----
  confirmDelete(item: OperationAccount): void {
    this.deleteTarget = item;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    if (this.deleteTarget) {
      this.svc.deleteAccount(this.deleteTarget.id).subscribe({
        next: () => {
          this.loadRoots();
        },
        error: (err) => { console.error('Delete error:', err); alert('Failed to delete account'); }
      });
    }
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  goBack(): void {
    this.router.navigate(['/accounting/codes']);
  }

  getIndentPadding(level: number): string {
    return `${level * 28 + 8}px`;
  }
}