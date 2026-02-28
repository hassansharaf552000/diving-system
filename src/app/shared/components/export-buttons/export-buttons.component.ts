import { Component, Input } from '@angular/core';
import { ExportService } from '../../services/export.service';

@Component({
    standalone:false,
  selector: 'app-export-buttons',
  templateUrl: './export-buttons.component.html',
  styleUrls: ['./export-buttons.component.scss']
})
export class ExportButtonsComponent {
  @Input() data: any[] = [];
  @Input() filename: string = 'export_data';

  constructor(private exportService: ExportService) {}

  exportExcel() {
    this.exportService.exportToExcel(this.data, this.filename);
  }
}
