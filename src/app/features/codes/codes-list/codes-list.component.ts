import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';

@Component({
  selector: 'app-codes-list',
  standalone: false,
  templateUrl: './codes-list.component.html',
  styleUrl: './codes-list.component.scss'
})
export class CodesListComponent implements OnInit {
  searchTerm = '';

  codes = [
    { label: 'Agent',               route: '/codes/agent',                  icon: '🏢', desc: 'Manage travel agents & contacts',       gradient: 'linear-gradient(135deg, #667eea, #764ba2)', count: 0 },
    { label: 'Boat',                route: '/codes/boat',                   icon: '🚢', desc: 'Boats, capacity & availability',        gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', count: 0 },
    { label: 'Excursion',           route: '/codes/excursion',              icon: '🏖️', desc: 'Excursion packages & details',          gradient: 'linear-gradient(135deg, #fa709a, #fee140)', count: 0 },
    { label: 'Excursion Supplier',  route: '/codes/excursion-supplier',     icon: '🤝', desc: 'Suppliers for excursion services',      gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', count: 0 },
    { label: 'Guide',               route: '/codes/guide',                  icon: '👤', desc: 'Tour guides & contact info',           gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', count: 0 },
    { label: 'Hotel',               route: '/codes/hotel',                  icon: '🏨', desc: 'Hotel listings & destinations',        gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)', count: 0 },
    { label: 'Hotel Destination',   route: '/codes/hotel-destination',      icon: '📍', desc: 'Destination areas for hotels',         gradient: 'linear-gradient(135deg, #d4fc79, #96e6a1)', count: 0 },
    { label: 'Nationality',         route: '/codes/nationality',            icon: '🌍', desc: 'Customer nationality codes',           gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)', count: 0 },
    { label: 'Price List',          route: '/codes/price-list',             icon: '💲', desc: 'Pricing configurations',               gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)', count: 0 },
    { label: 'Rate',                route: '/codes/rate',                   icon: '💱', desc: 'Currency exchange rates',              gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)', count: 0 },
    { label: 'Rep',                 route: '/codes/rep',                    icon: '👨‍💼', desc: 'Sales representatives',                gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', count: 0 },
    { label: 'Transportation Type', route: '/codes/transportation-type',    icon: '🚗', desc: 'Vehicle types & categories',           gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', count: 0 },
    { label: 'Trans. Supplier',     route: '/codes/transportation-supplier',icon: '🏗️', desc: 'Transportation service providers',     gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', count: 0 },
    { label: 'Transportation Cost', route: '/codes/transportation-cost',    icon: '💵', desc: 'Cost per route & vehicle',             gradient: 'linear-gradient(135deg, #fa709a, #fee140)', count: 0 },
    { label: 'Voucher',             route: '/codes/voucher',                icon: '🎫', desc: 'Voucher numbers & tracking',           gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', count: 0 }
  ];

  constructor(private router: Router, private svc: CodeService) { }

  ngOnInit(): void {
    this.svc.getAgents().subscribe(d => this.codes[0].count = d.length);
    this.svc.getBoats().subscribe(d => this.codes[1].count = d.length);
    this.svc.getExcursions().subscribe(d => this.codes[2].count = d.length);
    this.svc.getExcursionSuppliers().subscribe(d => this.codes[3].count = d.length);
    this.svc.getGuides().subscribe(d => this.codes[4].count = d.length);
    this.svc.getHotels().subscribe(d => this.codes[5].count = d.length);
    this.svc.getHotelDestinations().subscribe(d => this.codes[6].count = d.length);
    this.svc.getNationalities().subscribe(d => this.codes[7].count = d.length);
    this.svc.getPriceLists().subscribe(d => this.codes[8].count = d.length);
    this.svc.getRates().subscribe(d => this.codes[9].count = d.length);
    this.svc.getReps().subscribe(d => this.codes[10].count = d.length);
    this.svc.getTransportationTypes().subscribe(d => this.codes[11].count = d.length);
    this.svc.getTransportationSuppliers().subscribe(d => this.codes[12].count = d.length);
    this.svc.getTransportationCosts().subscribe(d => this.codes[13].count = d.length);
    this.svc.getVouchers().subscribe(d => this.codes[14].count = d.length);
  }

  get filteredCodes() {
    if (!this.searchTerm) return this.codes;
    const term = this.searchTerm.toLowerCase();
    return this.codes.filter(c => c.label.toLowerCase().includes(term) || c.desc.toLowerCase().includes(term));
  }

  openCode(code: any): void {
    this.router.navigate([code.route]);
  }
}
