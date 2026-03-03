import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { environment } from '../../../environments/environment';

/** A single lookup entry: what the user sees vs what gets stored */
export interface LookupEntry { id: number | string; name: string; }

/** Map of column header name → lookup list */
export type LookupMap = { [columnName: string]: LookupEntry[] };

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  exportToExcel(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      alert('No data to export.');
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  /**
   * Downloads an Excel template with real dropdown (Data Validation) columns.
   * Uses ExcelJS which properly writes dataValidation XML into the .xlsx file.
   *
   * @param columns  Column header names for the data entry sheet
   * @param filename Base filename (without extension)
   * @param lookups  Map of column name → { id, name }[] — those columns get
   *                 a real Excel dropdown. Names appear to the user; on import
   *                 the frontend maps names back to ids automatically.
   */
  async downloadTemplate(columns: string[], filename: string, lookups: LookupMap = {}): Promise<void> {
    const wb = new ExcelJS.Workbook();

    // ── 1. Hidden lookup sheet (stores id + name pairs for reference) ───────
    const lookupCols = Object.keys(lookups);

    if (lookupCols.length > 0) {
      const lookupSheet = wb.addWorksheet('__Lookups__');
      lookupSheet.state = 'hidden';

      lookupCols.forEach((col, ci) => {
        const entries = lookups[col];
        const colOffset = ci * 2 + 1; // 1-indexed columns: id in ci*2+1, name in ci*2+2

        // Header row
        lookupSheet.getCell(1, colOffset).value = `${col}_id`;
        lookupSheet.getCell(1, colOffset + 1).value = col;

        // Data rows
        entries.forEach((entry, ri) => {
          lookupSheet.getCell(ri + 2, colOffset).value = entry.id;
          lookupSheet.getCell(ri + 2, colOffset + 1).value = entry.name;
        });
      });
    }

    // ── 2. Data entry / template sheet ──────────────────────────────────────
    const dataSheet = wb.addWorksheet('Template');

    // Header row — styled
    const headerRow = dataSheet.addRow(columns);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Freeze top row
    dataSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Set column widths
    columns.forEach((col, i) => {
      dataSheet.getColumn(i + 1).width = Math.max(col.length + 4, 18);
    });

    // ── 3. Data Validation dropdowns ────────────────────────────────────────
    const DATA_ROWS = 500; // apply validation to first 500 data rows

    columns.forEach((col, ci) => {
      if (!lookups[col]) return;

      const entries = lookups[col];
      const excelCol = dataSheet.getColumn(ci + 1);
      const colLetter = excelCol.letter;

      // Apply validation to rows 2→501 (row 1 is the header)
      for (let row = 2; row <= DATA_ROWS + 1; row++) {
        const cell = dataSheet.getCell(`${colLetter}${row}`);
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${entries.map(e => e.name).join(',')}"`],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'Invalid value',
          error: `Please select a value from the dropdown list`
        };
      }
    });

    // ── 4. Write & trigger download ─────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    // Trigger browser download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_template.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importFromExcel(endpoint: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}${endpoint}`, formData);
  }

  /**
   * Reads an Excel file and returns a JSON array of row objects.
   * For columns that have lookups, replaces the display name with the numeric id.
   */
  parseFlatExcel(file: File, lookups: LookupMap = {}): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          // Read from the first non-lookup sheet
          const sheetName = wb.SheetNames.find(n => n !== '__Lookups__') || wb.SheetNames[0];
          const ws = wb.Sheets[sheetName];
          const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

          // Build reverse-lookup maps: name → id
          const reverseMaps: { [col: string]: { [name: string]: number | string } } = {};
          for (const col of Object.keys(lookups)) {
            reverseMaps[col] = {};
            for (const entry of lookups[col]) {
              reverseMaps[col][entry.name] = entry.id;
            }
          }

          // Map each row: replace name → id for lookup columns
          const mapped = rows.map(row => {
            const out: any = { ...row };
            for (const col of Object.keys(lookups)) {
              if (col in out) {
                const val = out[col];
                const id = reverseMaps[col][val];
                if (id !== undefined) {
                  out[col] = id;
                }
              }
            }
            return out;
          });

          resolve(mapped);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Converts an array of row objects (with IDs already resolved) back into
   * an xlsx File object that can be sent as multipart/form-data.
   *
   * @param rows     Mapped row objects (lookup columns already hold IDs, not names)
   * @param filename Desired filename for the resulting File
   */
  rowsToExcelFile(rows: any[], filename: string): Promise<File> {
    return new Promise((resolve, reject) => {
      try {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const buffer: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        resolve(new File([blob], filename, { type: blob.type }));
      } catch (err) {
        reject(err);
      }
    });
  }
}
