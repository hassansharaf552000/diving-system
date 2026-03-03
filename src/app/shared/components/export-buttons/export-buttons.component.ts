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
    this.exportService.exportToExcel(this.data, this.filename || this.resourceName || 'export_data');
  }

  downloading = false;

  downloadTemplate(): void {
    if (!this.columns || this.columns.length === 0) {
      alert('No columns defined for this template.');
      return;
    }
    this.downloading = true;
    this.exportService.downloadTemplate(
      this.columns,
      this.resourceName || this.filename || 'template',
      this.lookups
    ).then(() => {
      this.downloading = false;
    }).catch(err => {
      this.downloading = false;
      alert('Failed to generate template: ' + (err?.message || err));
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
      alert('Import endpoint not configured.');
      return;
    }

    this.importing = true;
    this.importError = null;
    this.importSuccess = null;

    const hasLookups = Object.keys(this.lookups).length > 0;

    if (hasLookups) {
      this.exportService.parseFlatExcel(file, this.lookups).then(rows => {
        return this.exportService.rowsToExcelFile(rows, file.name);
      }).then(mappedFile => {
        const formData = new FormData();
        formData.append('file', mappedFile, file.name);
        this.http.post<any>(`${this.api}${this.importEndpoint}`, formData).subscribe({
          next: (res) => this.ngZone.run(() => this.handleImportSuccess(res)),
          error: (err) => this.ngZone.run(() => this.handleImportError(err))
        });
      }).catch(err => {
        // Promise-level failure (file read / re-serialize error) — still show modal
        this.ngZone.run(() => this.handleImportError({ error: { message: err?.message || String(err) } }));
      });
    } else {
      this.exportService.importFromExcel(this.importEndpoint, file).subscribe({
        next: (res: any) => this.handleImportSuccess(res),
        error: (err: any) => this.handleImportError(err)
      });
    }
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
