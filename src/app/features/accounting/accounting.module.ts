import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// Accounting Codes Components
import { AccountingCodesListComponent } from './accounting-codes/accounting-codes-list/accounting-codes-list.component';
import { AccountingCodeAccountComponent } from './accounting-codes/accounting-code-account/accounting-code-account.component';
import { AccountingCodePeriodComponent } from './accounting-codes/accounting-code-period/accounting-code-period.component';
import { AccountingCodeAgentComponent } from './accounting-codes/accounting-code-agent/accounting-code-agent.component';
import { AccountingCodeBeneficiaryNameComponent } from './accounting-codes/accounting-code-beneficiary-name/accounting-code-beneficiary-name.component';
import { AccountingCodeBeneficiaryTypeComponent } from './accounting-codes/accounting-code-beneficiary-type/accounting-code-beneficiary-type.component';
import { AccountingCodeCostCenterComponent } from './accounting-codes/accounting-code-cost-center/accounting-code-cost-center.component';
import { AccountingCodeFileComponent } from './accounting-codes/accounting-code-file/accounting-code-file.component';
import { AccountingCodeRateComponent } from './accounting-codes/accounting-code-rate/accounting-code-rate.component';

// Accounting Entries Components
import { AccountingEntriesListComponent } from './accounting-entries/accounting-entries-list/accounting-entries-list.component';
import { AccountingEntryTreasuryTransactionComponent } from './accounting-entries/accounting-entry-treasury-transaction/accounting-entry-treasury-transaction.component';
import { AccountingEntryCounterComponent } from './accounting-entries/accounting-entry-counter/accounting-entry-counter.component';
import { AccountingFollowCollectionComponent } from './accounting-entries/accounting-follow-collection/accounting-follow-collection.component';
import { AccountingFollowPaymentComponent } from './accounting-entries/accounting-follow-payment/accounting-follow-payment.component';
import { AccountingUpdateTransactionsRateComponent } from './accounting-entries/accounting-update-transactions-rate/accounting-update-transactions-rate.component';
import { AccountingPostTransactionsComponent } from './accounting-entries/accounting-post-transactions/accounting-post-transactions.component';

@NgModule({
  declarations: [
    // Accounting Codes
    AccountingCodesListComponent,
    AccountingCodeAccountComponent,
    AccountingCodePeriodComponent,
    AccountingCodeAgentComponent,
    AccountingCodeBeneficiaryNameComponent,
    AccountingCodeBeneficiaryTypeComponent,
    AccountingCodeCostCenterComponent,
    AccountingCodeFileComponent,
    AccountingCodeRateComponent,
    
    // Accounting Entries
    AccountingEntriesListComponent,
    AccountingEntryTreasuryTransactionComponent,
    AccountingEntryCounterComponent,
    AccountingFollowCollectionComponent,
    AccountingFollowPaymentComponent,
    AccountingUpdateTransactionsRateComponent,
    AccountingPostTransactionsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ]
})
export class AccountingModule { }