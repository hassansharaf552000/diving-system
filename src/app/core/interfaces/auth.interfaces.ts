export type UserRole = 'SuperAdmin' | 'Admin' | 'Manager' | 'User';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userName: string;
  fullName: string;
  email: string;
  role: UserRole;
  id: number;
}

export interface UserProfile {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface CreateUserRequest {
  userName: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  userName?: string;
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}
