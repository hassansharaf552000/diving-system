import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  standalone: false,
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  stats = [
    { label: 'Technical Support', value: '24/7', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { label: 'Help Articles', value: '50+', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { label: 'Customer Satisfaction', value: '100%', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  ];
}
