import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: false,
  template: `
    <div class="landing-container">
      <div class="header">
        <h1 class="title">Diving System</h1>
        <p class="subtitle">Choose your module to continue</p>
      </div>
      
      <div class="options-container">
        <div class="option-card operation-card" (click)="navigateToOperation()">
          <div class="icon">
            <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2>Operation</h2>
          <p>Access the operational system including dashboard, entries, codes, and reports</p>
        </div>

        <div class="option-card accounting-card" (click)="navigateToAccounting()">
          <div class="icon">
            <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <h2>Accounting</h2>
          <p>Business accounting module with codes and entries management</p>
        </div>
      </div>

      <!-- Bubble effects -->
      <div class="bubble bubble-1"></div>
      <div class="bubble bubble-2"></div>
      <div class="bubble bubble-3"></div>
      <div class="bubble bubble-4"></div>
      <div class="bubble bubble-5"></div>
      <div class="bubble bubble-6"></div>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .header {
      text-align: center;
      margin-bottom: 3rem;
      color: white;
    }

    .title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0;
    }

    .options-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 800px;
      width: 100%;
    }

    .option-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .option-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .operation-card {
      border-left: 5px solid #4CAF50;
    }

    .operation-card:hover {
      background: rgba(76, 175, 80, 0.1);
    }

    .accounting-card {
      border-left: 5px solid #FF9800;
    }

    .accounting-card:hover {
      background: rgba(255, 152, 0, 0.1);
    }

    .operation-card .icon {
      color: #4CAF50;
      margin-bottom: 1rem;
    }

    .accounting-card .icon {
      color: #FF9800;
      margin-bottom: 1rem;
    }

    .option-card h2 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: #333;
      font-weight: 600;
    }

    .option-card p {
      color: #666;
      font-size: 1rem;
      line-height: 1.5;
      margin: 0;
    }

    .bubble {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
      pointer-events: none;
    }

    .bubble-1 {
      width: 40px;
      height: 40px;
      left: 10%;
      animation-delay: 0s;
    }

    .bubble-2 {
      width: 60px;
      height: 60px;
      left: 25%;
      animation-delay: 2s;
    }

    .bubble-3 {
      width: 30px;
      height: 30px;
      left: 40%;
      animation-delay: 4s;
    }

    .bubble-4 {
      width: 50px;
      height: 50px;
      right: 30%;
      animation-delay: 1s;
    }

    .bubble-5 {
      width: 35px;
      height: 35px;
      right: 15%;
      animation-delay: 3s;
    }

    .bubble-6 {
      width: 45px;
      height: 45px;
      right: 5%;
      animation-delay: 5s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    @media (max-width: 768px) {
      .title {
        font-size: 2rem;
      }
      
      .options-container {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      
      .option-card {
        padding: 2rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  constructor(private router: Router) {}

  navigateToOperation(): void {
    this.router.navigate(['/operation']);
  }

  navigateToAccounting(): void {
    this.router.navigate(['/accounting']);
  }
}