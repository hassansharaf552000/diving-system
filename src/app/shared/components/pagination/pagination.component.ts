import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: false,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  readonly pageSizes = [5, 10, 20, 50];
  internalPageSize = 10;

  ngOnChanges(): void {
    this.internalPageSize = this.pageSize;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.internalPageSize));
  }

  get recordsInfo(): string {
    if (this.totalItems === 0) return '0 records';
    const start = (this.currentPage - 1) * this.internalPageSize + 1;
    const end = Math.min(this.currentPage * this.internalPageSize, this.totalItems);
    return `${start} – ${end} of ${this.totalItems}`;
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [1];

    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push(-1);
    pages.push(total);

    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  onPageSizeChanged(): void {
    this.pageSizeChange.emit(Number(this.internalPageSize));
  }
}
