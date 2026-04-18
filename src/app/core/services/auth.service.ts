import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  UserProfile,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
} from '../interfaces/auth.interfaces';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/api/Auth`;

  private _currentUser = new BehaviorSubject<UserProfile | null>(this._loadUser());
  currentUser$ = this._currentUser.asObservable();

  // ── Auth ──────────────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        const user: UserProfile = {
          id: res.id,
          userName: res.userName,
          fullName: res.fullName,
          email: res.email,
          role: res.role,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._currentUser.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.next(null);
    this.router.navigate(['/login']);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  currentUser(): UserProfile | null {
    return this._currentUser.value;
  }

  hasRole(...roles: UserRole[]): boolean {
    const user = this.currentUser();
    return !!user && roles.includes(user.role);
  }

  private _loadUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  }

  // ── Me ────────────────────────────────────────────────────────────────────

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`);
  }

  // ── Users CRUD ────────────────────────────────────────────────────────────

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.baseUrl}/users`);
  }

  getUserById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/${id}`);
  }

  createUser(data: CreateUserRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.baseUrl}/create-user`, data);
  }

  updateUser(id: number, data: UpdateUserRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }
}
