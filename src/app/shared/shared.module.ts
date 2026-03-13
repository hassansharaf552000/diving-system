import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ModalComponent } from './components/modal/modal.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ExportButtonsComponent } from './components/export-buttons/export-buttons.component';
import { ToastComponent } from './components/toast/toast.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SearchableSelectComponent } from './components/searchable-select/searchable-select.component';

@NgModule({
  declarations: [
    ModalComponent,
    DataTableComponent,
    SearchBoxComponent,
    ConfirmDialogComponent,
    ExportButtonsComponent,
    ToastComponent,
    PaginationComponent,
    SearchableSelectComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ModalComponent,
    DataTableComponent,
    SearchBoxComponent,
    ConfirmDialogComponent,
    ExportButtonsComponent,
    ToastComponent,
    PaginationComponent,
    SearchableSelectComponent,
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }
