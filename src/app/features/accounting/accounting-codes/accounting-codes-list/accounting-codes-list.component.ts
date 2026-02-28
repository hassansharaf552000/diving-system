import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingService, AccountingCode } from '../../../../core/services/accounting.service';

interface CodeCard {
  key: string;
  displayName: string;
  icon: string;
  desc: string;
  gradient: string;
  route: string;
}

@Component({
  selector: 'app-accounting-codes-list',
  standalone: false,
  templateUrl: './accounting-codes-list.component.html',
  styleUrl: './accounting-codes-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountingCodesListComponent implements OnInit {
  private readonly accountingService = inject(AccountingService);
  private readonly router = inject(Router);
  
  protected readonly codes = signal<CodeCard[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  searchTerm = signal('');

  protected readonly filteredCodes = computed(() => {
    const currentCodes = this.codes();
    const term = this.searchTerm().toLowerCase();
    if (!term) return currentCodes;
    return currentCodes.filter(c =>
      c.displayName.toLowerCase().includes(term) || c.desc.toLowerCase().includes(term)
    );
  });

  // Visual + route mapping for accounting code types
  private readonly codeVisuals: Record<string, { icon: string; desc: string; gradient: string; route: string }> = {
    'operationaccounts': {
      icon: '📊',
      desc: 'Operation account tree',
      gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
      route: '/accounting/codes/operationaccounts'
    },
    'codeperiods': {
      icon: '📅',
      desc: 'Manage accounting periods',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      route: '/accounting/codes/codeperiods'
    },
    'codeagents': {
      icon: '👨‍💼',
      desc: 'Agent code management',
      gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
      route: '/accounting/codes/codeagents'
    },
    'codebeneficiarynames': {
      icon: '👤',
      desc: 'Beneficiary name records',
      gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
      route: '/accounting/codes/codebeneficiarynames'
    },
    'codebeneficiarytypes': {
      icon: '🏷️',
      desc: 'Beneficiary type classification',
      gradient: 'linear-gradient(135deg, #f6d365, #fda085)',
      route: '/accounting/codes/codebeneficiarytypes'
    },
    'codecostcenters': {
      icon: '🏢',
      desc: 'Cost center management',
      gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      route: '/accounting/codes/codecostercenters'
    },
    'codefilenumbers': {
      icon: '📁',
      desc: 'File number tracking',
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      route: '/accounting/codes/codefilenumbers'
    },
    'operationrates': {
      icon: '💱',
      desc: 'Exchange rate management',
      gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
      route: '/accounting/codes/operationrates'
    }
  };

  private readonly defaultGradients = [
    'linear-gradient(135deg, #a8edea, #fed6e3)',
    'linear-gradient(135deg, #ffecd2, #fcb69f)',
    'linear-gradient(135deg, #89f7fe, #66a6ff)'
  ];

  ngOnInit(): void {
    this.loadAccountingCodes();
  }

  loadAccountingCodes(): void {
    this.loading.set(true);
    this.error.set(null);
    this.accountingService.getAccountingCodes().subscribe({
      next: (apiCodes) => {
        const mapped = apiCodes.map((code, i) => {
          const visual = this.codeVisuals[code.key.toLowerCase()] || {
            icon: '🏷️',
            desc: code.displayName,
            gradient: this.defaultGradients[i % this.defaultGradients.length],
            route: `/accounting/codes/${code.key}`
          };
          return {
            key: code.key,
            displayName: code.displayName,
            icon: visual.icon,
            desc: visual.desc,
            gradient: visual.gradient,
            route: visual.route
          };
        });
        this.codes.set(mapped);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading accounting codes:', err);
        this.error.set('Failed to load accounting codes');
        this.loading.set(false);
      }
    });
  }

  openCode(code: CodeCard): void {
    this.router.navigate([code.route]);
  }
}