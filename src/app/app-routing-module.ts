import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './features/landing/landing.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EntriesComponent } from './features/entries/entries.component';
import { EntryTransactionComponent } from './features/entries/entry-transaction/entry-transaction.component';
import { EntryTrafficComponent } from './features/entries/entry-traffic/entry-traffic.component';
import { EntryRevenueComponent } from './features/entries/entry-revenue/entry-revenue.component';
import { EntryGuideAllowanceComponent } from './features/entries/entry-guide-allowance/entry-guide-allowance.component';
import { EntryRepCommissionComponent } from './features/entries/entry-rep-commission/entry-rep-commission.component';
import { EntryBoatCoastComponent } from './features/entries/entry-boat-coast/entry-boat-coast.component';
import { ReportsComponent } from './features/reports/reports.component';
import { HelpComponent } from './features/help/help.component';
import { CodesListComponent } from './features/codes/codes-list/codes-list.component';
import { CodeAgentComponent } from './features/codes/code-agent/code-agent.component';
import { CodeBoatComponent } from './features/codes/code-boat/code-boat.component';
import { CodeExcursionComponent } from './features/codes/code-excursion/code-excursion.component';
import { CodeExcursionSupplierComponent } from './features/codes/code-excursion-supplier/code-excursion-supplier.component';
import { CodeGuideComponent } from './features/codes/code-guide/code-guide.component';
import { CodeHotelComponent } from './features/codes/code-hotel/code-hotel.component';
import { CodeHotelDestinationComponent } from './features/codes/code-hotel-destination/code-hotel-destination.component';
import { CodeNationalityComponent } from './features/codes/code-nationality/code-nationality.component';
import { CodePriceListComponent } from './features/codes/code-price-list/code-price-list.component';
import { CodeRateComponent } from './features/codes/code-rate/code-rate.component';
import { CodeRepComponent } from './features/codes/code-rep/code-rep.component';
import { CodeTransportationTypeComponent } from './features/codes/code-transportation-type/code-transportation-type.component';
import { CodeTransportationSupplierComponent } from './features/codes/code-transportation-supplier/code-transportation-supplier.component';
import { CodeTransportationCostComponent } from './features/codes/code-transportation-cost/code-transportation-cost.component';
import { CodeVoucherComponent } from './features/codes/code-voucher/code-voucher.component';
import { CodeExcursionCostSellingComponent } from './features/codes/code-excursion-cost-selling/code-excursion-cost-selling.component';

// Accounting Components Import
import { AccountingCodesListComponent } from './features/accounting/accounting-codes/accounting-codes-list/accounting-codes-list.component';
import { AccountingCodeAccountComponent } from './features/accounting/accounting-codes/accounting-code-account/accounting-code-account.component';
import { AccountingCodePeriodComponent } from './features/accounting/accounting-codes/accounting-code-period/accounting-code-period.component';
import { AccountingCodeAgentComponent } from './features/accounting/accounting-codes/accounting-code-agent/accounting-code-agent.component';
import { AccountingCodeBeneficiaryNameComponent } from './features/accounting/accounting-codes/accounting-code-beneficiary-name/accounting-code-beneficiary-name.component';
import { AccountingCodeBeneficiaryTypeComponent } from './features/accounting/accounting-codes/accounting-code-beneficiary-type/accounting-code-beneficiary-type.component';
import { AccountingCodeCostCenterComponent } from './features/accounting/accounting-codes/accounting-code-cost-center/accounting-code-cost-center.component';
import { AccountingCodeFileComponent } from './features/accounting/accounting-codes/accounting-code-file/accounting-code-file.component';
import { AccountingCodeRateComponent } from './features/accounting/accounting-codes/accounting-code-rate/accounting-code-rate.component';
import { AccountingEntriesListComponent } from './features/accounting/accounting-entries/accounting-entries-list/accounting-entries-list.component';
import { AccountingEntryTreasuryTransactionComponent } from './features/accounting/accounting-entries/accounting-entry-treasury-transaction/accounting-entry-treasury-transaction.component';
import { AccountingEntryCounterComponent } from './features/accounting/accounting-entries/accounting-entry-counter/accounting-entry-counter.component';
import { AccountingFollowCollectionComponent } from './features/accounting/accounting-entries/accounting-follow-collection/accounting-follow-collection.component';
import { AccountingFollowPaymentComponent } from './features/accounting/accounting-entries/accounting-follow-payment/accounting-follow-payment.component';
import { AccountingUpdateTransactionsRateComponent } from './features/accounting/accounting-entries/accounting-update-transactions-rate/accounting-update-transactions-rate.component';
import { AccountingPostTransactionsComponent } from './features/accounting/accounting-entries/accounting-post-transactions/accounting-post-transactions.component';

const routes: Routes = [
  // Landing page
  { path: '', component: LandingComponent },
  
  // Operation module (current system)
  {
    path: 'operation',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'entries', component: EntriesComponent },
      { path: 'entries/transaction', component: EntryTransactionComponent },
      { path: 'entries/traffic', component: EntryTrafficComponent },
      { path: 'entries/revenue', component: EntryRevenueComponent },
      { path: 'entries/guide-allowance', component: EntryGuideAllowanceComponent },
      { path: 'entries/rep-commission', component: EntryRepCommissionComponent },
      { path: 'entries/boat-coast', component: EntryBoatCoastComponent },
      { path: 'codes', component: CodesListComponent },
      { path: 'codes/agent', component: CodeAgentComponent },
      { path: 'codes/boat', component: CodeBoatComponent },
      { path: 'codes/excursion', component: CodeExcursionComponent },
      { path: 'codes/excursion-supplier', component: CodeExcursionSupplierComponent },
      { path: 'codes/guide', component: CodeGuideComponent },
      { path: 'codes/hotel', component: CodeHotelComponent },
      { path: 'codes/hotel-destination', component: CodeHotelDestinationComponent },
      { path: 'codes/nationality', component: CodeNationalityComponent },
      { path: 'codes/price-list', component: CodePriceListComponent },
      { path: 'codes/rate', component: CodeRateComponent },
      { path: 'codes/rep', component: CodeRepComponent },
      { path: 'codes/transportation-type', component: CodeTransportationTypeComponent },
      { path: 'codes/transportation-supplier', component: CodeTransportationSupplierComponent },
      { path: 'codes/transportation-cost', component: CodeTransportationCostComponent },
      { path: 'codes/voucher', component: CodeVoucherComponent },
      { path: 'codes/excursion-cost-selling', component: CodeExcursionCostSellingComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  },
  
  // Accounting module
  {
    path: 'accounting',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent }, // Will be replaced with accounting dashboard
      { path: 'codes', component: AccountingCodesListComponent },
      { path: 'codes/operationaccounts', component: AccountingCodeAccountComponent },
      { path: 'codes/codeperiods', component: AccountingCodePeriodComponent },
      { path: 'codes/codeagents', component: AccountingCodeAgentComponent },
      { path: 'codes/codebeneficiarynames', component: AccountingCodeBeneficiaryNameComponent },
      { path: 'codes/codebeneficiarytypes', component: AccountingCodeBeneficiaryTypeComponent },
      { path: 'codes/codecostercenters', component: AccountingCodeCostCenterComponent },
      { path: 'codes/codefilenumbers', component: AccountingCodeFileComponent },
      { path: 'codes/operationrates', component: AccountingCodeRateComponent },
      { path: 'entries', component: AccountingEntriesListComponent },
      { path: 'entries/entrytreasurytransaction', component: AccountingEntryTreasuryTransactionComponent },
      { path: 'entries/entrycounter', component: AccountingEntryCounterComponent },
      { path: 'entries/followcollection', component: AccountingFollowCollectionComponent },
      { path: 'entries/followpayment', component: AccountingFollowPaymentComponent },
      { path: 'entries/updatetransactionsrate', component: AccountingUpdateTransactionsRateComponent },
      { path: 'entries/posttransactions', component: AccountingPostTransactionsComponent },
      { path: 'reports', component: ReportsComponent } // Will be replaced with accounting reports
    ]
  },
  
  // Fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
