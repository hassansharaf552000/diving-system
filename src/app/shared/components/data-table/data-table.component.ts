import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: false,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pageSize = 10;
  @Input() showSearch = true;
  @Output() rowSelected = new EventEmitter<any>();

  searchTerm = '';
  currentPage = 1;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedIndex = -1;

  get filteredData(): any[] {
    let result = this.data;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(item =>
        this.columns.some(col =>
          String(item[col.key] || '').toLowerCase().includes(term)
        )
      );
    }

    if (this.sortColumn) {
      result = [...result].sort((a, b) => {
        const aVal = String(a[this.sortColumn] || '');
        const bVal = String(b[this.sortColumn] || '');
        const cmp = aVal.localeCompare(bVal);
        return this.sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }

  get pagedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
  }

  get recordsInfo(): string {
    const total = this.filteredData.length;
    if (total === 0) return '0 records';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    return `${start} - ${end} of ${total}`;
  }

  sort(column: TableColumn): void {
    if (!column.sortable) return;
    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
  }

  selectRow(item: any, index: number): void {
    this.selectedIndex = index;
    this.rowSelected.emit(item);
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.selectedIndex = -1;
  }
}
