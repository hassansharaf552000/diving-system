import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { LayoutModule } from './layout/layout.module';
import { SharedModule } from './shared/shared.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { EntriesModule } from './features/entries/entries.module';
import { CodesModule } from './features/codes/codes.module';
import { ReportsModule } from './features/reports/reports.module';
import { HelpModule } from './features/help/help.module';
import { AccountingModule } from './features/accounting/accounting.module';
import { App } from './app';
import { LandingComponent } from './features/landing/landing.component';

@NgModule({
  declarations: [
    App,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    LayoutModule,
    SharedModule,
    DashboardModule,
    EntriesModule,
    CodesModule,
    AccountingModule,
    ReportsModule,
    HelpModule
  ],
  bootstrap: [App]
})
export class AppModule { }
