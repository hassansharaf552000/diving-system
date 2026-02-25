import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OperationAccount, OperationAccountCreate, CodePeriod, CodeBeneficiaryName, CodeBeneficiaryType, CodeCostCenter, CodeFileNumber, CodeAgent, TreasuryTransaction, TreasuryTransactionCreate, TreasuryCounter, TreasuryCounterCreate } from '../interfaces/code.interfaces';

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

  // ========== OPERATION ACCOUNTS ==========
  getRootAccounts(): Observable<OperationAccount[]> {
    return this.http.get<OperationAccount[]>(`${this.baseUrl}/OperationAccounts/roots`);
  }

  getChildAccounts(parentId: number): Observable<OperationAccount[]> {
    return this.http.get<OperationAccount[]>(`${this.baseUrl}/OperationAccounts/${parentId}/children`);
  }

  getAccount(id: number): Observable<OperationAccount> {
    return this.http.get<OperationAccount>(`${this.baseUrl}/OperationAccounts/${id}`);
  }

  getAccountByNumber(accountNumber: string): Observable<OperationAccount> {
    return this.http.get<OperationAccount>(`${this.baseUrl}/OperationAccounts/by-number/${accountNumber}`);
  }

  searchAccounts(query: string): Observable<OperationAccount[]> {
    return this.http.get<OperationAccount[]>(`${this.baseUrl}/OperationAccounts/search?q=${encodeURIComponent(query)}`);
  }

  createAccount(data: OperationAccountCreate): Observable<OperationAccount> {
    return this.http.post<OperationAccount>(`${this.baseUrl}/OperationAccounts`, data);
  }

  updateAccount(id: number, data: Partial<OperationAccount>): Observable<OperationAccount> {
    return this.http.put<OperationAccount>(`${this.baseUrl}/OperationAccounts/${id}`, data);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/OperationAccounts/${id}`);
  }

  // ========== CODE PERIODS ==========
  getCodePeriods(): Observable<CodePeriod[]> {
    return this.http.get<CodePeriod[]>(`${this.baseUrl}/CodePeriods`);
  }

  getCodePeriod(id: number): Observable<CodePeriod> {
    return this.http.get<CodePeriod>(`${this.baseUrl}/CodePeriods/${id}`);
  }

  createCodePeriod(data: CodePeriod): Observable<CodePeriod> {
    return this.http.post<CodePeriod>(`${this.baseUrl}/CodePeriods`, data);
  }

  updateCodePeriod(id: number, data: CodePeriod): Observable<CodePeriod> {
    return this.http.put<CodePeriod>(`${this.baseUrl}/CodePeriods/${id}`, data);
  }

  deleteCodePeriod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/CodePeriods/${id}`);
  }

  // ========== CODE BENEFICIARY NAMES ==========
  getCodeBeneficiaryNames(): Observable<CodeBeneficiaryName[]> {
    return this.http.get<CodeBeneficiaryName[]>(`${this.baseUrl}/CodeBeneficiaryNames`);
  }

  getCodeBeneficiaryName(id: number): Observable<CodeBeneficiaryName> {
    return this.http.get<CodeBeneficiaryName>(`${this.baseUrl}/CodeBeneficiaryNames/${id}`);
  }

  createCodeBeneficiaryName(data: CodeBeneficiaryName): Observable<CodeBeneficiaryName> {
    return this.http.post<CodeBeneficiaryName>(`${this.baseUrl}/CodeBeneficiaryNames`, data);
  }

  updateCodeBeneficiaryName(id: number, data: CodeBeneficiaryName): Observable<CodeBeneficiaryName> {
    return this.http.put<CodeBeneficiaryName>(`${this.baseUrl}/CodeBeneficiaryNames/${id}`, data);
  }

  deleteCodeBeneficiaryName(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/CodeBeneficiaryNames/${id}`);
  }

  // ========== CODE BENEFICIARY TYPES ==========
  getCodeBeneficiaryTypes(): Observable<CodeBeneficiaryType[]> {
    return this.http.get<CodeBeneficiaryType[]>(`${this.baseUrl}/CodeBeneficiaryTypes`);
  }

  getCodeBeneficiaryType(id: number): Observable<CodeBeneficiaryType> {
    return this.http.get<CodeBeneficiaryType>(`${this.baseUrl}/CodeBeneficiaryTypes/${id}`);
  }

  createCodeBeneficiaryType(data: CodeBeneficiaryType): Observable<CodeBeneficiaryType> {
    return this.http.post<CodeBeneficiaryType>(`${this.baseUrl}/CodeBeneficiaryTypes`, data);
  }

  updateCodeBeneficiaryType(id: number, data: CodeBeneficiaryType): Observable<CodeBeneficiaryType> {
    return this.http.put<CodeBeneficiaryType>(`${this.baseUrl}/CodeBeneficiaryTypes/${id}`, data);
  }

  deleteCodeBeneficiaryType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/CodeBeneficiaryTypes/${id}`);
  }

  // ========== CODE COST CENTERS ==========
  getCodeCostCenters(): Observable<CodeCostCenter[]> {
    return this.http.get<CodeCostCenter[]>(`${this.baseUrl}/CodeCostCenters`);
  }

  getCodeCostCenter(id: number): Observable<CodeCostCenter> {
    return this.http.get<CodeCostCenter>(`${this.baseUrl}/CodeCostCenters/${id}`);
  }

  createCodeCostCenter(data: CodeCostCenter): Observable<CodeCostCenter> {
    return this.http.post<CodeCostCenter>(`${this.baseUrl}/CodeCostCenters`, data);
  }

  updateCodeCostCenter(id: number, data: CodeCostCenter): Observable<CodeCostCenter> {
    return this.http.put<CodeCostCenter>(`${this.baseUrl}/CodeCostCenters/${id}`, data);
  }

  deleteCodeCostCenter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/CodeCostCenters/${id}`);
  }

  // ========== CODE FILE NUMBERS ==========
  getCodeFileNumbers(): Observable<CodeFileNumber[]> {
    return this.http.get<CodeFileNumber[]>(`${this.baseUrl}/CodeFileNumbers`);
  }

  getCodeFileNumber(id: number): Observable<CodeFileNumber> {
    return this.http.get<CodeFileNumber>(`${this.baseUrl}/CodeFileNumbers/${id}`);
  }

  createCodeFileNumber(data: CodeFileNumber): Observable<CodeFileNumber> {
    return this.http.post<CodeFileNumber>(`${this.baseUrl}/CodeFileNumbers`, data);
  }

  updateCodeFileNumber(id: number, data: CodeFileNumber): Observable<CodeFileNumber> {
    return this.http.put<CodeFileNumber>(`${this.baseUrl}/CodeFileNumbers/${id}`, data);
  }

  deleteCodeFileNumber(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/CodeFileNumbers/${id}`);
  }

  // ========== CODE AGENTS ==========
  getCodeAgents(): Observable<CodeAgent[]> {
    return this.http.get<CodeAgent[]>(`${this.baseUrl}/CodeAgents`);
  }

  getCodeAgent(id: number): Observable<CodeAgent> {
    return this.http.get<CodeAgent>(`${this.baseUrl}/CodeAgents/${id}`);
  }

  createCodeAgent(data: CodeAgent): Observable<CodeAgent> {
    return this.http.post<CodeAgent>(`${this.baseUrl}/CodeAgents`, data);
  }

  updateCodeAgent(id: number, data: CodeAgent): Observable<CodeAgent> {
    return this.http.put<CodeAgent>(`${this.baseUrl}/CodeAgents/${id}`, data);
  }

  deleteCodeAgent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/CodeAgents/${id}`);
  }

  // ========== TREASURY TRANSACTIONS ==========
  searchTreasuryTransactions(search?: string, fromDate?: string, toDate?: string, type?: number): Observable<TreasuryTransaction[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (type) params = params.set('type', type.toString());
    return this.http.get<TreasuryTransaction[]>(`${this.baseUrl}/TreasuryTransactions`, { params });
  }

  getTreasuryTransaction(id: number): Observable<TreasuryTransaction> {
    return this.http.get<TreasuryTransaction>(`${this.baseUrl}/TreasuryTransactions/${id}`);
  }

  createTreasuryTransaction(data: TreasuryTransactionCreate): Observable<TreasuryTransaction> {
    return this.http.post<TreasuryTransaction>(`${this.baseUrl}/TreasuryTransactions`, data);
  }

  updateTreasuryTransaction(id: number, data: TreasuryTransactionCreate): Observable<TreasuryTransaction> {
    return this.http.put<TreasuryTransaction>(`${this.baseUrl}/TreasuryTransactions/${id}`, data);
  }

  deleteTreasuryTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/TreasuryTransactions/${id}`);
  }

  // ========== TREASURY COUNTERS ==========
  searchTreasuryCounters(currency?: string, branch?: string, fromDate?: string, toDate?: string): Observable<TreasuryCounter[]> {
    let params = new HttpParams();
    if (currency) params = params.set('currency', currency);
    if (branch) params = params.set('branch', branch);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<TreasuryCounter[]>(`${this.baseUrl}/TreasuryCounters`, { params });
  }

  getTreasuryCounter(id: number): Observable<TreasuryCounter> {
    return this.http.get<TreasuryCounter>(`${this.baseUrl}/TreasuryCounters/${id}`);
  }

  createTreasuryCounter(data: TreasuryCounterCreate): Observable<TreasuryCounter> {
    return this.http.post<TreasuryCounter>(`${this.baseUrl}/TreasuryCounters`, data);
  }

  deleteTreasuryCounter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/TreasuryCounters/${id}`);
  }
}