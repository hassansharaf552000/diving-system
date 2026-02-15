import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EntriesComponent } from './features/entries/entries.component';
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

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'entries', component: EntriesComponent },
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
      { path: 'reports', component: ReportsComponent },
      { path: 'help', component: HelpComponent },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
