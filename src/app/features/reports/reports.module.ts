import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

// Accounting Components
import { AccountingReports } from './accounting-reports/accounting-reports';
import { CodesReports as AccountingCodesReports } from './accounting/codes-reports/codes-reports';
import { Counter } from './accounting/counter/counter';
import { Transaction } from './accounting/transaction/transaction';
import { TaxTransaction } from './accounting/tax-transaction/tax-transaction';
import { SupplierBalance } from './accounting/supplier-balance/supplier-balance';
import { AccountBalance } from './accounting/account-balance/account-balance';
import { GeneralFollow } from './accounting/general-follow/general-follow';
import { CashBalance } from './accounting/cash-balance/cash-balance';
import { SearchMovements } from './accounting/search-movements/search-movements';
import { GeneralSubsidiaryLedger } from './accounting/general-subsidiary-ledger/general-subsidiary-ledger';
import { AccountSubsidiaryLedger } from './accounting/account-subsidiary-ledger/account-subsidiary-ledger';
import { FileServiceSubsidiaryLedger } from './accounting/file-service-subsidiary-ledger/file-service-subsidiary-ledger';
import { CostCenterSubsidiaryLedger } from './accounting/cost-center-subsidiary-ledger/cost-center-subsidiary-ledger';
import { DeletedSubsidiaryLedger } from './accounting/deleted-subsidiary-ledger/deleted-subsidiary-ledger';
import { FileProfitAndLoss } from './accounting/file-profit-and-loss/file-profit-and-loss';
import { ProfitAndLoss } from './accounting/profit-and-loss/profit-and-loss';
import { TrialBalance } from './accounting/trial-balance/trial-balance';

// Operation Components
import { OperationReports } from './operation-reports/operation-reports';
import { CodesReports as OperationCodesReports } from './operation/codes-reports/codes-reports';
import { Traffic } from './operation/traffic/traffic';
import { InvoiceAgent } from './operation/invoice-agent/invoice-agent';
import { InvoiceBoatSupplier } from './operation/invoice-boat-supplier/invoice-boat-supplier';
import { InvoiceExcursionSupplier } from './operation/invoice-excursion-supplier/invoice-excursion-supplier';
import { InvoiceTransportationSupplier } from './operation/invoice-transportation-supplier/invoice-transportation-supplier';
import { GuideAllowance } from './operation/guide-allowance/guide-allowance';
import { RepCommission } from './operation/rep-commission/rep-commission';
import { VoucherDataQuery } from './operation/voucher-data-query/voucher-data-query';
import { Search } from './operation/search/search';

// Routes moved to app-routing.module.ts

@NgModule({
  declarations: [
    AccountingReports,
    OperationReports,
    
    AccountingCodesReports, Counter, Transaction, TaxTransaction, SupplierBalance,
    AccountBalance, GeneralFollow, CashBalance, SearchMovements, GeneralSubsidiaryLedger,
    AccountSubsidiaryLedger, FileServiceSubsidiaryLedger, CostCenterSubsidiaryLedger,
    DeletedSubsidiaryLedger, FileProfitAndLoss, ProfitAndLoss, TrialBalance,
    
    OperationCodesReports, Traffic, InvoiceAgent, InvoiceBoatSupplier, InvoiceExcursionSupplier,
    InvoiceTransportationSupplier, GuideAllowance, RepCommission, VoucherDataQuery, Search
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [AccountingReports, OperationReports]
})
export class ReportsModule { }
