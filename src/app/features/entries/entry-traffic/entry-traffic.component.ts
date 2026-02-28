import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  EntryTraffic, Excursion, PriceList, Agent, Hotel,
  Nationality, ExcursionSupplier, Boat, TransportationSupplier
} from '../../../core/interfaces/code.interfaces';
import { CodeService } from '../../../core/services/code.service';

@Component({
  selector: 'app-entry-traffic',
  standalone: false,
  templateUrl: './entry-traffic.component.html',
  styleUrl: './entry-traffic.component.scss'
})
export class EntryTrafficComponent implements OnInit {

  // Filter Models
  filters = {
    fromDate: '',
    toDate: '',
    excursionId: undefined as number | undefined,
    priceListId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    hotelId: undefined as number | undefined,
    nationalityId: undefined as number | undefined,
    excursionSupplierId: undefined as number | undefined,
    boatId: undefined as number | undefined,
    transportationSupplierId: undefined as number | undefined
  };

  // Dropdown Lists
  excursions: Excursion[] = [];
  priceLists: PriceList[] = [];
  agents: Agent[] = [];
  hotels: Hotel[] = [];
  nationalities: Nationality[] = [];
  excursionSuppliers: ExcursionSupplier[] = [];
  boats: Boat[] = [];
  transportationSuppliers: TransportationSupplier[] = [];

  // Data
  trafficData: EntryTraffic[] = [];
  loading = false;

  constructor(
    private codeService: CodeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadDropdowns();
    this.viewTraffic();
  }

  setDefaultDates() {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    this.filters.fromDate = formatted;
    this.filters.toDate = formatted;
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
      transportationSuppliers: this.codeService.getTransportationSuppliers()
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
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dropdowns', err);
        this.loading = false;
      }
    });
  }

  viewTraffic() {
    this.loading = true;
    this.codeService.getEntryTraffic(this.filters).subscribe({
      next: (res) => {
        this.trafficData = res || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching traffic data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearFilter() {
    this.filters = {
      fromDate: '',
      toDate: '',
      excursionId: undefined,
      priceListId: undefined,
      agentId: undefined,
      hotelId: undefined,
      nationalityId: undefined,
      excursionSupplierId: undefined,
      boatId: undefined,
      transportationSupplierId: undefined
    };
    this.setDefaultDates();
    this.trafficData = [];
    this.cdr.detectChanges();
  }

  // Derived Summary Counts
  get totalADL(): number {
    return this.trafficData.reduce((sum, item) => sum + (item.adl || 0), 0);
  }

  get totalCHD(): number {
    return this.trafficData.reduce((sum, item) => sum + (item.chd || 0), 0);
  }

  get totalINF(): number {
    return this.trafficData.reduce((sum, item) => sum + (item.inf || 0), 0);
  }

  get totalCount(): number {
    return this.trafficData.reduce((sum, item) => sum + ((item.adl || 0) + (item.chd || 0) + (item.inf || 0)), 0);
  }
}
