import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReportDefinition {
  key: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  getAccountingReports(): Observable<ReportDefinition[]> {
    return this.http.get<ReportDefinition[]>(`${environment.apiUrl}/api/AllAccountingReports`);
  }

  getOperationReports(): Observable<ReportDefinition[]> {
    return this.http.get<ReportDefinition[]>(`${environment.apiUrl}/api/AllOperationReports`);
  }

  downloadReport(endpoint: string, filters: any): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}${endpoint}`, {
      params: filters,
      responseType: 'blob'
    });
  }

  getAccountBalanceReceipts(accountId: number, transactionType?: number): Observable<string[]> {
    let params = new HttpParams().set('accountId', accountId.toString());
    if (transactionType != null) {
      params = params.set('transactionType', transactionType.toString());
    }
    return this.http.get<string[]>(`${environment.apiUrl}/api/AccountBalanceReport/receipts`, { params });
  }

  getReportData<T>(endpoint: string, filters: any): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${endpoint}`, { params: filters });
  }
}
