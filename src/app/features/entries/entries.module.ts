import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { EntriesComponent } from './entries.component';

@NgModule({
  declarations: [EntriesComponent],
  imports: [SharedModule],
  exports: [EntriesComponent]
})
export class EntriesModule { }
