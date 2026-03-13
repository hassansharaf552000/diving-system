import {
  Component,
  Input,
  forwardRef,
  OnChanges,
  SimpleChanges,
  HostListener,
  ElementRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-searchable-select',
  standalone: false,
  templateUrl: './searchable-select.component.html',
  styleUrl: './searchable-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true
    }
  ]
})
export class SearchableSelectComponent implements ControlValueAccessor, OnChanges {

  @Input() items: any[] = [];
  @Input() labelKey: string = 'name';
  @Input() valueKey: string = 'id';
  @Input() placeholder: string = 'Search...';
  @Input() nullLabel: string = '-';

  searchTerm: string = '';
  isOpen: boolean = false;
  selectedLabel: string = '';
  selectedValue: any = undefined;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Re-sync label when items list loads (may come in after value is already set)
    if (changes['items'] && this.selectedValue !== undefined && this.selectedValue !== null) {
      this.syncLabel(this.selectedValue);
    }
  }

  get filteredItems(): any[] {
    if (!this.searchTerm) return this.items;
    const term = this.searchTerm.toLowerCase();
    return this.items.filter(item =>
      String(item[this.labelKey] || '').toLowerCase().includes(term)
    );
  }

  onInputFocus(): void {
    this.searchTerm = '';
    this.isOpen = true;
  }

  onInputChange(): void {
    this.isOpen = true;
    // When user types, clear the selected value until they pick from list
    if (this.selectedValue !== undefined) {
      this.selectedValue = undefined;
      this.onChange(undefined);
    }
  }

  selectItem(item: any): void {
    this.selectedValue = item[this.valueKey];
    this.selectedLabel = String(item[this.labelKey] || '');
    this.searchTerm = '';
    this.isOpen = false;
    this.onChange(this.selectedValue);
    this.onTouched();
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedValue = undefined;
    this.selectedLabel = '';
    this.searchTerm = '';
    this.isOpen = false;
    this.onChange(undefined);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      // Restore label in input on outside click
    }
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.selectedValue = value;
    this.syncLabel(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {}

  private syncLabel(value: any): void {
    if (value === undefined || value === null) {
      this.selectedLabel = '';
      return;
    }
    const found = this.items.find(item => item[this.valueKey] === value);
    this.selectedLabel = found ? String(found[this.labelKey] || '') : '';
  }

  get displayValue(): string {
    return this.isOpen ? this.searchTerm : (this.selectedLabel || '');
  }

  onInputBlur(): void {
    this.onTouched();
    // Restore label on blur (don't clear selection)
    if (!this.isOpen) {
      this.searchTerm = '';
    }
  }
}
