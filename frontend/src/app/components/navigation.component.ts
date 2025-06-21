import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from './theme-toggle.component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  template: `
    <nav class="bg-white dark:bg-gray-900 shadow-md py-4 px-8 flex items-center justify-between transition-colors duration-300">
      <div class="flex items-center space-x-6">
        <a routerLink="/public-info" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">Home</a>
        <a routerLink="/services" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">Services</a>
        <a routerLink="/insurance" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">Insurance</a>
        <a routerLink="/faq" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">FAQ</a>
        <a routerLink="/emergency" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">Emergency</a>
        <a routerLink="/ai-symptom" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">AI Symptom</a>
        <a routerLink="/wearable-data" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">Wearables</a>
        <a routerLink="/admin-dashboard" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">Admin</a>
      </div>
      <div class="flex items-center space-x-4">
        <app-theme-toggle></app-theme-toggle>
        <ng-container *ngIf="isLoggedIn; else loginLinks">
          <button (click)="logout()" class="btn-secondary">Logout</button>
        </ng-container>
        <ng-template #loginLinks>
          <a routerLink="/login" class="btn-primary">Login</a>
          <a routerLink="/register" class="btn-secondary">Register</a>
        </ng-template>
      </div>
    </nav>
  `,
  styles: []
})
export class NavigationComponent {
  @Input() isLoggedIn = false;
  @Input() logout: () => void = () => {};
} 