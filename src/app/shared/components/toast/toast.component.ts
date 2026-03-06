import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  get toasts$() {
    return this.toastService.toasts$;
  }

  remove(id: number) {
    this.toastService.remove(id);
  }
}
