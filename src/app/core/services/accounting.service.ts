import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AccountingCode {
  key: string;
  displayName: string;
}

export interface AccountingEntry {
  key: string;
  displayName: string;
}

export interface OperationEntry {
  key: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  getAccountingCodes(): Observable<AccountingCode[]> {
    return this.http.get<AccountingCode[]>(`${this.baseUrl}/AccountingCodes`);
  }

  getAccountingEntries(): Observable<AccountingEntry[]> {
    return this.http.get<AccountingEntry[]>(`${this.baseUrl}/AccountingEntry`);
  }

  getOperationEntries(): Observable<OperationEntry[]> {
    return this.http.get<OperationEntry[]>(`${this.baseUrl}/OperationEntries`);
  }
}