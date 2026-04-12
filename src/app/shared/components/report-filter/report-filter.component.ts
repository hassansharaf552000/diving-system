import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CodeService } from '../../../core/services/code.service';
import { forkJoin } from 'rxjs';
import {
  Excursion, Agent, Hotel, Nationality, ExcursionSupplier, Boat,
  TransportationSupplier, PriceList, TransportationType, Guide, Rep
} from '../../../core/interfaces/code.interfaces';

@Component({
  selector: 'app-report-filter',
  standalone: false,
  templateUrl: './report-filter.component.html',
  styleUrls: ['./report-filter.component.scss']
})
export class ReportFilterComponent implements OnInit {

  @Input() filters: any = {};
  @Input() showFields: string[] = [];
  @Input() reportOptions: string[] = [];
  @Input() reportTypeOptions: string[] = [];
  @Input() groupByOptions: string[] = [];
  @Input() reportByOptions: string[] = [];
  @Input() paidTypeOptions: string[] = [];
  
  @Output() onView = new EventEmitter<any>();
  @Output() onPdf = new EventEmitter<any>();
  @Output() onExcel = new EventEmitter<any>();

  // Helper to remove undefined or null properties
  private getCleanedFilters(): any {
    const cleaned: any = {};
    for (const key in this.filters) {
      if (this.filters[key] !== undefined && this.filters[key] !== null && this.filters[key] !== '') {
        cleaned[key] = this.filters[key];
      }
    }
    return cleaned;
  }

  triggerView() {
    this.onView.emit(this.getCleanedFilters());
  }

  triggerPdf() {
    this.onPdf.emit(this.getCleanedFilters());
  }

  triggerExcel() {
    this.onExcel.emit(this.getCleanedFilters());
  }

  loading = false;

  excursions: Excursion[] = [];
  priceLists: PriceList[] = [];
  agents: Agent[] = [];
  hotels: Hotel[] = [];
  nationalities: Nationality[] = [];
  excursionSuppliers: ExcursionSupplier[] = [];
  boats: Boat[] = [];
  transportationSuppliers: TransportationSupplier[] = [];
  transportationTypes: TransportationType[] = [];
  guides: Guide[] = [];
  reps: Rep[] = [];

  guideDuties = ['Snorkeling', 'Diving']; // Correct options for guide duty

  constructor(private codeService: CodeService) {}

  ngOnInit(): void {
    if (!this.filters.fromDate) {
      const today = new Date().toISOString().split('T')[0];
      this.filters.fromDate = today;
      this.filters.toDate = today;
    }
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.loading = true;
    forkJoin({
      excursions: this.codeService.getExcursions(),
      priceLists: this.codeService.getPriceLists(),
      agents: this.codeService.getAgents(),
      hotels: this.codeService.getHotels(),
      nationalities: this.codeService.getNationalities(),
      excursionSuppliers: this.codeService.getExcursionSuppliers(),
      boats: this.codeService.getBoats(),
      transportationSuppliers: this.codeService.getTransportationSuppliers(),
      transportationTypes: this.codeService.getTransportationTypes(),
      guides: this.codeService.getGuides(),
      reps: this.codeService.getReps(),
    }).subscribe({
      next: (res) => {
        this.excursions = res.excursions;
        this.priceLists = res.priceLists;
        this.agents = res.agents;
        this.hotels = res.hotels;
        this.nationalities = res.nationalities;
        this.excursionSuppliers = res.excursionSuppliers;
        this.boats = res.boats;
        this.transportationSuppliers = res.transportationSuppliers;
        this.transportationTypes = res.transportationTypes;
        this.guides = res.guides;
        this.reps = res.reps;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dropdowns in ReportFilterComponent', err);
        this.loading = false;
      }
    });
  }

  hasField(field: string): boolean {
    return this.showFields.includes(field);
  }

  onExcursionChange(excursionId: number | undefined): void {
    if (this.hasField('excursionSupplierId')) {
      if (excursionId) {
        const excursion = this.excursions.find(e => e.id === excursionId);
        if (excursion?.supplierId) {
          this.filters.excursionSupplierId = excursion.supplierId;
        }
      } else {
        this.filters.excursionSupplierId = undefined;
      }
    }
  }

  onAgentChange(agentId: number | undefined): void {
    if (this.hasField('nationalityId')) {
      if (agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent?.nationalityId) {
          this.filters.nationalityId = agent.nationalityId;
        }
      } else {
        this.filters.nationalityId = undefined;
      }
    }
  }
}
