import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Input() title = '';
  @Input() isOpen = false;
  @Input() size: 'small' | 'medium' | 'large' | 'full' = 'large';
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
}
