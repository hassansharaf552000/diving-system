import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CodeService } from '../../../core/services/code.service';
import { CodeDefinition } from '../../../core/interfaces/code.interfaces';

interface CodeCard {
  key: string;
  label: string;
  route: string;
  icon: string;
  desc: string;
  gradient: string;
  count: number;
}

@Component({
  selector: 'app-codes-list',
  standalone: false,
  templateUrl: './codes-list.component.html',
  styleUrl: './codes-list.component.scss'
})
export class CodesListComponent implements OnInit {
  searchTerm = '';
  codes: CodeCard[] = [];
  isLoading = true;

  private codeMetadata: Record<string, { icon: string; desc: string; gradient: string; route: string }> = {
    agents:                  { icon: '🏢', desc: 'Manage travel agents & contacts',   gradient: 'linear-gradient(135deg, #667eea, #764ba2)', route: '/operation/codes/agent' },
    boats:                   { icon: '🚢', desc: 'Boats, capacity & availability',    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', route: '/operation/codes/boat' },
    excursions:              { icon: '🏖️', desc: 'Excursion packages & details',      gradient: 'linear-gradient(135deg, #fa709a, #fee140)', route: '/operation/codes/excursion' },
    excursionsuppliers:      { icon: '🤝', desc: 'Suppliers for excursion services',  gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', route: '/operation/codes/excursion-supplier' },
    excursioncostsellings:   { icon: '💰', desc: 'Excursion cost & selling prices',   gradient: 'linear-gradient(135deg, #f6d365, #fda085)', route: '/operation/codes/excursion-cost-selling' },
    reps:                    { icon: '👨‍💼', desc: 'Sales representatives',            gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', route: '/operation/codes/rep' },
    guides:                  { icon: '👤', desc: 'Tour guides & contact info',       gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', route: '/operation/codes/guide' },
    hotels:                  { icon: '🏨', desc: 'Hotel listings & destinations',    gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)', route: '/operation/codes/hotel' },
    hoteldestinations:       { icon: '📍', desc: 'Destination areas for hotels',     gradient: 'linear-gradient(135deg, #d4fc79, #96e6a1)', route: '/operation/codes/hotel-destination' },
    nationalities:           { icon: '🌍', desc: 'Customer nationality codes',       gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)', route: '/operation/codes/nationality' },
    pricelists:              { icon: '💲', desc: 'Pricing configurations',           gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)', route: '/operation/codes/price-list' },
    rates:                   { icon: '💱', desc: 'Currency exchange rates',          gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)', route: '/operation/codes/rate' },
    transportationtypes:     { icon: '🚗', desc: 'Vehicle types & categories',       gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', route: '/operation/codes/transportation-type' },
    transportationsuppliers: { icon: '🏗️', desc: 'Transportation service providers', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', route: '/operation/codes/transportation-supplier' },
    transportationcosts:     { icon: '💵', desc: 'Cost per route & vehicle',         gradient: 'linear-gradient(135deg, #fa709a, #fee140)', route: '/operation/codes/transportation-cost' },
    repvouchers:             { icon: '🎫', desc: 'Voucher numbers & tracking',       gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', route: '/operation/codes/voucher' }
  };

  constructor(private router: Router, private svc: CodeService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.svc.getCodes().subscribe({
      next: definitions => {
        this.codes = definitions.map(def => {
          const meta = this.codeMetadata[def.key] || {
            icon: '📋',
            desc: def.displayName,
            gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
            route: `/operation/codes/${def.key}`
          };
          return {
            key: def.key,
            label: def.displayName.replace('Code ', ''),
            route: meta.route,
            icon: meta.icon,
            desc: meta.desc,
            gradient: meta.gradient,
            count: 0
          };
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error fetching codes', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
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
