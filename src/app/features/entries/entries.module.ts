import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { EntriesComponent } from './entries.component';
import { EntryTransactionComponent } from './entry-transaction/entry-transaction.component';
import { EntryTrafficComponent } from './entry-traffic/entry-traffic.component';
import { EntryRevenueComponent } from './entry-revenue/entry-revenue.component';
import { EntryGuideAllowanceComponent } from './entry-guide-allowance/entry-guide-allowance.component';
import { EntryRepCommissionComponent } from './entry-rep-commission/entry-rep-commission.component';
import { EntryBoatCoastComponent } from './entry-boat-coast/entry-boat-coast.component';

@NgModule({
  declarations: [
    EntriesComponent,
    EntryTransactionComponent,
    EntryTrafficComponent,
    EntryRevenueComponent,
    EntryGuideAllowanceComponent,
    EntryRepCommissionComponent,
    EntryBoatCoastComponent
  ],
  imports: [
    SharedModule,
    RouterModule
  ],
  exports: [EntriesComponent]
})
export class EntriesModule { }
