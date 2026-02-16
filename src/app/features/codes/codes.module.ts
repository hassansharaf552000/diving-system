import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { CodesListComponent } from './codes-list/codes-list.component';
import { CodeAgentComponent } from './code-agent/code-agent.component';
import { CodeBoatComponent } from './code-boat/code-boat.component';
import { CodeExcursionComponent } from './code-excursion/code-excursion.component';
import { CodeExcursionSupplierComponent } from './code-excursion-supplier/code-excursion-supplier.component';
import { CodeGuideComponent } from './code-guide/code-guide.component';
import { CodeHotelComponent } from './code-hotel/code-hotel.component';
import { CodeHotelDestinationComponent } from './code-hotel-destination/code-hotel-destination.component';
import { CodeNationalityComponent } from './code-nationality/code-nationality.component';
import { CodePriceListComponent } from './code-price-list/code-price-list.component';
import { CodeRateComponent } from './code-rate/code-rate.component';
import { CodeRepComponent } from './code-rep/code-rep.component';
import { CodeTransportationTypeComponent } from './code-transportation-type/code-transportation-type.component';
import { CodeTransportationSupplierComponent } from './code-transportation-supplier/code-transportation-supplier.component';
import { CodeTransportationCostComponent } from './code-transportation-cost/code-transportation-cost.component';
import { CodeVoucherComponent } from './code-voucher/code-voucher.component';
import { CodeExcursionCostSellingComponent } from './code-excursion-cost-selling/code-excursion-cost-selling.component';

@NgModule({
  declarations: [
    CodesListComponent,
    CodeAgentComponent,
    CodeBoatComponent,
    CodeExcursionComponent,
    CodeExcursionSupplierComponent,
    CodeGuideComponent,
    CodeHotelComponent,
    CodeHotelDestinationComponent,
    CodeNationalityComponent,
    CodePriceListComponent,
    CodeRateComponent,
    CodeRepComponent,
    CodeTransportationTypeComponent,
    CodeTransportationSupplierComponent,
    CodeTransportationCostComponent,
    CodeVoucherComponent,
    CodeExcursionCostSellingComponent
  ],
  imports: [
    SharedModule,
    RouterModule
  ],
  exports: [
    CodesListComponent
  ]
})
export class CodesModule { }
