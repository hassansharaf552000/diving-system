import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-accounting-entry-counter',
  standalone: false,
  templateUrl: './accounting-entry-counter.component.html',
  styleUrl: './accounting-entry-counter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountingEntryCounterComponent {
}