import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PublicService, InsuranceProvider } from '../services/public.service';
import { Observable, catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-insurance-providers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div style="background-color: #F1F5F9; min-height: 100vh; padding: 20px;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #0891B2; font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
            Insurance Providers
          </h1>
          <p style="color: #666; font-size: 1.2rem;">
            We accept most major insurance plans to ensure accessible healthcare
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" style="text-align: center; padding: 40px;">
          <mat-spinner style="margin: 0 auto;"></mat-spinner>
          <p style="color: #666; margin-top: 20px;">Loading insurance providers...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" style="text-align: center; padding: 40px;">
          <mat-icon style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">error_outline</mat-icon>
          <h3 style="color: #DC2626; margin-bottom: 10px;">Unable to load insurance providers</h3>
          <p style="color: #666; margin-bottom: 20px;">Please try again or contact us for assistance.</p>
          <button 
            mat-raised-button 
            style="background-color: #0891B2; color: white;"
            (click)="loadInsuranceProviders()"
          >
            Try Again
          </button>
        </div>

        <!-- Insurance Providers Grid -->
        <div *ngIf="!loading && !error" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">
          <mat-card 
            *ngFor="let provider of insuranceProviders$ | async" 
            style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.2s;"
            (mouseenter)="onCardHover($event)"
            (mouseleave)="onCardLeave($event)"
          >
            <mat-card-header style="padding: 20px 20px 0;">
              <div style="display: flex; align-items: center; width: 100%;">
                <img 
                  *ngIf="provider.logo" 
                  [src]="provider.logo" 
                  [alt]="provider.name"
                  style="width: 80px; height: 40px; object-fit: contain; margin-right: 15px;"
                />
                <div>
                  <mat-card-title style="color: #0891B2; font-size: 1.3rem; font-weight: 600;">
                    {{provider.name}}
                  </mat-card-title>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content style="padding: 20px;">
              <!-- Contact Information -->
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <mat-icon style="color: #0891B2; margin-right: 10px; font-size: 20px;">phone</mat-icon>
                  <span style="color: #666;">{{provider.phone}}</span>
                </div>
                <div *ngIf="provider.website" style="display: flex; align-items: center;">
                  <mat-icon style="color: #0891B2; margin-right: 10px; font-size: 20px;">language</mat-icon>
                  <a 
                    [href]="provider.website" 
                    target="_blank"
                    style="color: #0891B2; text-decoration: none;"
                  >
                    {{provider.website}}
                  </a>
                </div>
              </div>

              <!-- Coverage Details -->
              <div style="margin-bottom: 20px;">
                <h4 style="color: #333; margin-bottom: 10px; font-weight: 600;">Coverage Details</h4>
                <p style="color: #666; line-height: 1.5;">{{provider.coverageDetails}}</p>
              </div>

              <!-- Accepted Plans -->
              <div *ngIf="provider.acceptedPlans && provider.acceptedPlans.length > 0">
                <h4 style="color: #333; margin-bottom: 10px; font-weight: 600;">Accepted Plans</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <span 
                    *ngFor="let plan of provider.acceptedPlans"
                    style="background-color: #E0F2FE; color: #0891B2; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: 500;"
                  >
                    {{plan}}
                  </span>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions style="padding: 0 20px 20px;">
              <button 
                mat-raised-button 
                style="background-color: #0891B2; color: white; width: 100%;"
                (click)="viewProviderDetails(provider)"
              >
                View Details
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- No Data State -->
        <div *ngIf="!loading && !error && (insuranceProviders$ | async)?.length === 0" style="text-align: center; padding: 40px;">
          <mat-icon style="font-size: 48px; color: #666; margin-bottom: 20px;">info_outline</mat-icon>
          <h3 style="color: #666; margin-bottom: 10px;">No insurance providers found</h3>
          <p style="color: #999;">Please check back later or contact us for more information.</p>
        </div>
      </div>
    </div>
  `
})
export class InsuranceProvidersComponent implements OnInit {
  private publicService = inject(PublicService);
  private snackBar = inject(MatSnackBar);

  insuranceProviders$: Observable<InsuranceProvider[]> = this.publicService.getInsuranceProviders().pipe(
    catchError(error => {
      console.error('Error loading insurance providers:', error);
      this.error = true;
      return of([]);
    }),
    finalize(() => {
      this.loading = false;
    })
  );

  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadInsuranceProviders();
  }

  loadInsuranceProviders(): void {
    this.loading = true;
    this.error = false;
    this.insuranceProviders$ = this.publicService.getInsuranceProviders().pipe(
      catchError(error => {
        console.error('Error loading insurance providers:', error);
        this.error = true;
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    );
  }

  viewProviderDetails(provider: InsuranceProvider): void {
    this.snackBar.open(`Viewing details for ${provider.name}...`, 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to provider details page or open modal
  }

  onCardHover(event: any): void {
    event.target.style.transform = 'translateY(-4px)';
    event.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
  }

  onCardLeave(event: any): void {
    event.target.style.transform = 'translateY(0)';
    event.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  }
} 