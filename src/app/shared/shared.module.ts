import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ModalComponent } from './components/modal/modal.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    ModalComponent,
    DataTableComponent,
    SearchBoxComponent,
    ConfirmDialogComponent
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
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }
