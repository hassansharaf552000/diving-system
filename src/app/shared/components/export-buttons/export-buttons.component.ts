import Swal from 'sweetalert2';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ExportService, LookupMap } from '../../services/export.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-export-buttons',
  templateUrl: './export-buttons.component.html',
  styleUrls: ['./export-buttons.component.scss']
})
export class ExportButtonsComponent {
  @Input() data: any[] = [];
  @Input() filename: string = 'export_data';
  @Input() importEndpoint: string = '';
  @Input() columns: string[] = [];
  @Input() resourceName: string = '';
  /**
   * Lookup map: column header → array of { id, name }.
   * Columns listed here will get a dropdown in the Excel template,
   * and on import the chosen name will be swapped for the id automatically.
   */
  @Input() lookups: LookupMap = {};
  /** Path to a static template file in /assets (e.g. 'EntryTransactions_Import_Template.xlsx'). When set, the Template button downloads this file instead of generating one. */
  @Input() templateAsset: string = '';
  @Output() imported = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  importing = false;
  importError: string | null = null;
  importSuccess: string | null = null;
  importSkipped: string[] = [];
  importWarning: string | null = null;
  showResultModal = false;

  private get api() { return environment.apiUrl; }

  closeResultModal(): void { this.showResultModal = false; }

  constructor(private exportService: ExportService, private http: HttpClient, private ngZone: NgZone) {}

  exportExcel(): void {
    // Build id→name maps for every lookup column, so we export readable names instead of raw IDs.
    const idToName: { [col: string]: { [id: string]: string } } = {};
    for (const col of Object.keys(this.lookups)) {
      idToName[col] = {};
      for (const entry of this.lookups[col]) {
        idToName[col][String(entry.id)] = entry.name;
      }
    }

    // Filter exported rows to only the template columns (so re-importing matches the import template).
    // For lookup columns, replace the stored ID with the human-readable name.
    let exportData = this.data;
    if (this.columns && this.columns.length > 0) {
      exportData = this.data.map(row => {
        const filtered: any = {};
        this.columns.forEach(col => {
          const rawVal = row[col] !== undefined ? row[col] : '';
          // If this column has a lookup, output the name instead of the ID
          if (idToName[col] && rawVal !== '') {
            filtered[col] = idToName[col][String(rawVal)] ?? rawVal;
          } else {
            filtered[col] = rawVal;
          }
        });
        return filtered;
      });
    }
    this.exportService.exportToExcel(exportData, this.filename || this.resourceName || 'export_data');
  }

  downloading = false;

  downloadTemplate(): void {
    if (this.templateAsset) {
      const link = document.createElement('a');
      link.href = this.templateAsset;
      link.download = this.templateAsset;
      link.click();
      return;
    }
    if (!this.columns || this.columns.length === 0) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('No columns defined for this template.');
      return;
    }
    this.downloading = true;
    this.exportService.downloadTemplate(
      this.columns,
      this.resourceName || this.filename || 'template',
      {}
    ).then(() => {
      this.downloading = false;
    }).catch(err => {
      this.downloading = false;
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Failed to generate template: ' + (err?.message || err));
    });
  }

  triggerImport(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (!this.importEndpoint) {
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'warning' }).fire('Import endpoint not configured.');
      return;
    }

    this.importing = true;
    this.importError = null;
    this.importSuccess = null;

    // Always send the original file directly to the API.
    // No parse/re-serialize round-trip — avoids blank row creation and column reordering.
    // Users fill in the template with values (IDs or text) which the backend handles directly.
    this.exportService.importFromExcel(this.importEndpoint, file).subscribe({
      next: (res: any) => this.handleImportSuccess(res),
      error: (err: any) => this.handleImportError(err)
    });
  }

  private handleImportSuccess(res: any): void {
    this.importing = false;
    this.importSkipped = [];
    this.importWarning = null;
    this.importSuccess = null;

    const count = res?.imported ?? res?.count ?? res?.rowsImported ?? null;
    const msg: string = res?.message || '';

    // Detect empty/zero-result responses — treat as warning, not success
    const isEmptyResult = count === 0 ||
      /empty|nothing|no record|no row|no data/i.test(msg);

    if (isEmptyResult) {
      this.importWarning = `⚠️ ${msg || 'No records were imported.'}`;
    } else if (msg) {
      this.importSuccess = `✅ ${msg}`;
    } else {
      this.importSuccess = count !== null
        ? `✅ Imported ${count} records successfully!`
        : '✅ Import successful!';
    }

    if (res?.skipped && Array.isArray(res.skipped) && res.skipped.length > 0) {
      this.importSkipped = res.skipped;
      this.importWarning = (this.importWarning ? this.importWarning + '  ' : '')
        + `⚠️ ${res.skipped.length} row(s) were skipped.`;
    }

    if (res?.errors && Array.isArray(res.errors) && res.errors.length > 0) {
      this.importError = `❌ Errors: ${res.errors.join(', ')}`;
    }

    this.showResultModal = true;
    this.imported.emit();
  }

  private handleImportError(err: any): void {
    this.importing = false;
    this.importSuccess = null;
    this.importSkipped = [];
    this.importWarning = null;

    // Extract the human-readable message from every possible backend error shape:
    //   { message: '...' }  |  { title: '...' }  |  { errors: ['...'] }  |  plain string
    const body = err?.error;
    let msg: string;
    if (typeof body === 'string' && body.length > 0) {
      msg = body;
    } else if (body?.message) {
      msg = body.message;
    } else if (body?.title) {
      msg = body.title;
    } else if (Array.isArray(body?.errors) && body.errors.length > 0) {
      msg = body.errors.join(', ');
    } else {
      msg = 'Import failed. Please check the file format.';
    }

    this.importError = `❌ ${msg}`;
    this.showResultModal = true;

  }
}
