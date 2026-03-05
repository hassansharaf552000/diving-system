import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
