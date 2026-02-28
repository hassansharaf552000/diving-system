import { Component, OnInit } from '@angular/core';
import { CodeService } from '../../core/services/code.service';
import { EntryTransaction } from '../../core/interfaces/code.interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  stats = [
    { label: "Today's Bookings", value: '24', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { label: 'Completed Dives', value: '12', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { label: 'Occupancy Rate', value: '85%', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { label: 'Monthly Revenue', value: '$12,450', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
  ];
}
