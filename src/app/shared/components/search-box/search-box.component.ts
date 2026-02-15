import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-box',
  standalone: false,
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss'
})
export class SearchBoxComponent {
  @Input() placeholder = 'Search...';
  @Output() searchChange = new EventEmitter<string>();

  searchTerm = '';

  onInput(): void {
    this.searchChange.emit(this.searchTerm);
  }
}
