import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeToggleComponent } from './theme-toggle.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    ThemeToggleComponent
  ],
  template: `
    <nav class="bg-white dark:bg-gray-900 shadow-md py-4 px-8 flex items-center justify-between transition-colors duration-300">
      <div class="flex items-center space-x-6">
        <!-- AI Dashboard link - only visible to doctors and admins -->
        <a 
          *ngIf="hasAIAccess()" 
          routerLink="/ai" 
          routerLinkActive="text-primary-600 font-bold" 
          class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition"
        >
          AI Dashboard
        </a>
        <a routerLink="/public-info" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">Home</a>
        <a routerLink="/services" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">Services</a>
        <a routerLink="/insurance" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">Insurance</a>
        <a routerLink="/faq" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">FAQ</a>
        <a routerLink="/emergency" routerLinkActive="text-primary-600 font-bold" class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition">Emergency</a>
      </div>
      
      <div class="flex items-center space-x-4">
        <app-theme-toggle></app-theme-toggle>
        
        <!-- Authentication Buttons -->
        <div *ngIf="!isLoggedIn" class="flex items-center space-x-3">
          <button 
            mat-stroked-button 
            class="border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20"
            (click)="goToLogin()"
          >
            <mat-icon class="mr-2" style="font-size: 18px;">login</mat-icon>
            Login
          </button>
          <button 
            mat-raised-button 
            class="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
            (click)="goToRegister()"
          >
            <mat-icon class="mr-2" style="font-size: 18px;">person_add</mat-icon>
            Register
          </button>
        </div>

        <!-- User Menu (when logged in) -->
        <div *ngIf="isLoggedIn" class="flex items-center space-x-3">
          <button 
            mat-button 
            [matMenuTriggerFor]="userMenu"
            class="text-secondary-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <mat-icon class="mr-2" style="font-size: 20px;">account_circle</mat-icon>
            {{ userRole | titlecase }}
            <mat-icon class="ml-1" style="font-size: 16px;">arrow_drop_down</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="goToProfile()">
              <mat-icon>person</mat-icon>
              <span>My Profile</span>
            </button>
            <!-- AI Dashboard menu item - only visible to doctors and admins -->
            <button *ngIf="hasAIAccess()" mat-menu-item (click)="goToDashboard()">
              <mat-icon>dashboard</mat-icon>
              <span>AI Dashboard</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavigationComponent implements OnInit {
  @Input() isLoggedIn = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  userRole: string = '';

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.isLoggedIn().subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.userRole = this.authService.getUserRole() || 'User';
      }
    });

    // Check initial state
    this.isLoggedIn = !!this.authService.getToken();
    if (this.isLoggedIn) {
      this.userRole = this.authService.getUserRole() || 'User';
    }
  }

  /**
   * Check if the current user has access to AI features
   * Only doctors and admins should have access
   */
  hasAIAccess(): boolean {
    const role = this.authService.getUserRole();
    return role === 'doctor' || role === 'admin';
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  goToProfile(): void {
    this.router.navigate(['/auth/profile']);
  }

  goToDashboard(): void {
    // Only navigate to AI dashboard if user has access
    if (this.hasAIAccess()) {
      this.router.navigate(['/ai']);
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/public-info']);
      },
      error: () => {
        // Even if logout fails, clear local storage
        this.authService.logoutLocal();
        this.router.navigate(['/public-info']);
      }
    });
  }
} 