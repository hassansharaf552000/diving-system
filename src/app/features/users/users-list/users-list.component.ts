import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfile, UserRole, CreateUserRequest } from '../../../core/interfaces/auth.interfaces';

@Component({
  selector: 'app-users-list',
  standalone: false,
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  users: UserProfile[] = [];
  filteredUsers: UserProfile[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Modal state
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedUser: UserProfile | null = null;
  userForm!: FormGroup;
  isSaving = false;
  modalError = '';

  // Delete confirm
  showDeleteConfirm = false;
  userToDelete: UserProfile | null = null;
  isDeleting = false;

  // Search
  searchTerm = '';

  // Current user info
  currentUser: UserProfile | null = null;
  isSuperAdmin = false;

  // Available roles for dropdown (filtered by current user role)
  availableRoles: UserRole[] = [];

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser();
    this.isSuperAdmin = this.currentUser?.role === 'SuperAdmin';
    this.availableRoles = this.isSuperAdmin
      ? ['SuperAdmin', 'Admin', 'Manager', 'User']
      : ['Admin', 'Manager', 'User'];
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.auth.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load users.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  applyFilters(): void {
    let list = [...this.users];

    // Admin can see Admins, Managers and Users
    if (!this.isSuperAdmin) {
      list = list.filter((u) => u.role === 'Admin' || u.role === 'Manager' || u.role === 'User');
    }

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(
        (u) =>
          u.userName.toLowerCase().includes(term) ||
          u.fullName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.role.toLowerCase().includes(term)
      );
    }

    this.filteredUsers = list;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  // ── Add ───────────────────────────────────────────────────────────────────

  openAddModal(): void {
    this.modalMode = 'add';
    this.selectedUser = null;
    this.modalError = '';
    this.userForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [this.availableRoles[this.availableRoles.length - 1], Validators.required],
    });
    this.showModal = true;
  }

  // ── Edit ──────────────────────────────────────────────────────────────────

  openEditModal(user: UserProfile): void {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.modalError = '';
    this.userForm = this.fb.group({
      userName: [user.userName, [Validators.required, Validators.minLength(3)]],
      fullName: [user.fullName, Validators.required],
      email: [user.email, [Validators.required, Validators.email]],
      password: [''], // optional on edit
      role: [user.role, Validators.required],
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
    this.modalError = '';
  }

  onSubmitModal(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.modalError = '';

    if (this.modalMode === 'add') {
      const payload: CreateUserRequest = this.userForm.value;
      this.auth.createUser(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.successMessage = 'User created successfully.';
          this.loadUsers();
          this._clearSuccess();
        },
        error: (err) => {
          this.isSaving = false;
          this.modalError = err?.error?.message || 'Failed to create user.';
        },
      });
    } else if (this.selectedUser) {
      const raw = this.userForm.value;
      const payload: Record<string, string> = {
        userName: raw.userName,
        fullName: raw.fullName,
        email: raw.email,
        role: raw.role,
      };
      if (raw.password) payload['password'] = raw.password;

      this.auth.updateUser(this.selectedUser.id, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.successMessage = 'User updated successfully.';
          this.loadUsers();
          this._clearSuccess();
        },
        error: (err) => {
          this.isSaving = false;
          this.modalError = err?.error?.message || 'Failed to update user.';
        },
      });
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  confirmDelete(user: UserProfile): void {
    this.userToDelete = user;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.userToDelete = null;
  }

  executeDelete(): void {
    if (!this.userToDelete) return;
    this.isDeleting = true;
    this.auth.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.successMessage = 'User deleted successfully.';
        this.loadUsers();
        this._clearSuccess();
      },
      error: (err) => {
        this.isDeleting = false;
        this.errorMessage = err?.error?.message || 'Failed to delete user.';
        this.showDeleteConfirm = false;
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getRoleBadgeClass(role: UserRole): string {
    const map: Record<UserRole, string> = {
      SuperAdmin: 'badge-superadmin',
      Admin: 'badge-admin',
      Manager: 'badge-manager',
      User: 'badge-user',
    };
    return map[role] ?? '';
  }

  canEdit(user: UserProfile): boolean {
    if (this.isSuperAdmin) return true;
    // Admin can edit Admins, Managers and Users
    return user.role === 'Admin' || user.role === 'Manager' || user.role === 'User';
  }

  canDelete(user: UserProfile): boolean {
    return this.canEdit(user);
  }

  private _clearSuccess(): void {
    setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3500);
  }

  get f() { return this.userForm.controls; }
}
