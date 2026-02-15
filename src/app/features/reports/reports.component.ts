import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  stats = [
    { label: 'Occupancy Rate', value: '85%', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { label: 'Monthly Revenue', value: '$12,450', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { label: 'Total Dives', value: '156', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
  ];
}
