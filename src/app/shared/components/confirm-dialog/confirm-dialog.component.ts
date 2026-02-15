import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Delete';
  @Input() message = 'Are you sure you want to delete this record?';
  @Input() itemName = '';
  @Input() confirmText = 'Delete';
  @Input() cancelText = 'Cancel';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
