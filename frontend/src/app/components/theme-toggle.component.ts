import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <button 
      mat-icon-button 
      (click)="toggleTheme()" 
      [matTooltip]="(themeService.theme$ | async) === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      aria-label="Toggle theme"
      class="theme-toggle-btn">
      <mat-icon *ngIf="(themeService.theme$ | async) === 'dark'">light_mode</mat-icon>
      <mat-icon *ngIf="(themeService.theme$ | async) === 'light'">dark_mode</mat-icon>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      transition: all 0.3s ease;
    }
    
    .theme-toggle-btn:hover {
      transform: scale(1.1);
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
} 