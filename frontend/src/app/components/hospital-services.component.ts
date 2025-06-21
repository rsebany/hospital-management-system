import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { PublicService, HospitalService } from '../services/public.service';
import { Observable, catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-hospital-services',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    FormsModule
  ],
  template: `
    <div style="background-color: #F1F5F9; min-height: 100vh; padding: 20px;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #0891B2; font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
            Our Services
          </h1>
          <p style="color: #666; font-size: 1.2rem;">
            Comprehensive healthcare services delivered with compassion and excellence
          </p>
        </div>

        <!-- Search and Filter -->
        <div style="margin-bottom: 30px;">
          <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            <input 
              type="text" 
              placeholder="Search services..."
              [(ngModel)]="searchTerm"
              style="flex: 1; min-width: 250px; padding: 12px 16px; border: 2px solid #E2E8F0; border-radius: 8px; font-size: 16px; outline: none;"
              (input)="filterServices()"
            />
            <select 
              [(ngModel)]="selectedDepartment"
              (change)="filterServices()"
              style="padding: 12px 16px; border: 2px solid #E2E8F0; border-radius: 8px; font-size: 16px; outline: none; background: white; min-width: 200px;"
            >
              <option value="">All Departments</option>
              <option *ngFor="let dept of departments" [value]="dept">{{dept}}</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" style="text-align: center; padding: 40px;">
          <mat-spinner style="margin: 0 auto;"></mat-spinner>
          <p style="color: #666; margin-top: 20px;">Loading hospital services...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" style="text-align: center; padding: 40px;">
          <mat-icon style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">error_outline</mat-icon>
          <h3 style="color: #DC2626; margin-bottom: 10px;">Unable to load services</h3>
          <p style="color: #666; margin-bottom: 20px;">Please try again or contact us for assistance.</p>
          <button 
            mat-raised-button 
            style="background-color: #0891B2; color: white;"
            (click)="loadServices()"
          >
            Try Again
          </button>
        </div>

        <!-- Services Grid -->
        <div *ngIf="!loading && !error" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">
          <mat-card 
            *ngFor="let service of filteredServices" 
            style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.2s;"
            (mouseenter)="onCardHover($event)"
            (mouseleave)="onCardLeave($event)"
          >
            <mat-card-header style="padding: 20px 20px 0;">
              <mat-card-title style="color: #0891B2; font-size: 1.4rem; font-weight: 600; margin-bottom: 5px;">
                {{service.name}}
              </mat-card-title>
              <mat-card-subtitle *ngIf="service.department" style="color: #666; font-size: 1rem;">
                {{service.department}}
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content style="padding: 20px;">
              <!-- Description -->
              <div style="margin-bottom: 20px;">
                <p style="color: #666; line-height: 1.6;">{{service.description}}</p>
              </div>

              <!-- Service Details -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div *ngIf="service.duration">
                  <div style="color: #333; font-weight: 600; font-size: 0.9rem; margin-bottom: 5px;">Duration</div>
                  <div style="color: #666; font-size: 0.9rem;">{{service.duration}}</div>
                </div>
                <div *ngIf="service.cost">
                  <div style="color: #333; font-weight: 600; font-size: 0.9rem; margin-bottom: 5px;">Cost</div>
                  <div style="color: #059669; font-size: 0.9rem; font-weight: 600;">{{service.cost}}</div>
                </div>
                <div *ngIf="service.availability">
                  <div style="color: #333; font-weight: 600; font-size: 0.9rem; margin-bottom: 5px;">Availability</div>
                  <div style="color: #666; font-size: 0.9rem;">{{service.availability}}</div>
                </div>
              </div>

              <!-- Requirements -->
              <div *ngIf="service.requirements && service.requirements.length > 0">
                <div style="color: #333; font-weight: 600; font-size: 0.9rem; margin-bottom: 10px;">Requirements</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <span 
                    *ngFor="let requirement of service.requirements"
                    style="background-color: #FEF3C7; color: #D97706; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500;"
                  >
                    {{requirement}}
                  </span>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions style="padding: 0 20px 20px;">
              <button 
                mat-raised-button 
                style="background-color: #0891B2; color: white; width: 100%;"
                (click)="bookService(service)"
              >
                Book Service
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- No Results -->
        <div *ngIf="!loading && !error && filteredServices.length === 0" style="text-align: center; padding: 40px;">
          <mat-icon style="font-size: 48px; color: #666; margin-bottom: 20px;">search_off</mat-icon>
          <h3 style="color: #666; margin-bottom: 10px;">No services found</h3>
          <p style="color: #999;">Try adjusting your search terms or browse all departments.</p>
        </div>

        <!-- Contact Section -->
        <div style="margin-top: 40px; background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <h3 style="color: #0891B2; margin-bottom: 15px; font-size: 1.5rem;">Need help choosing a service?</h3>
          <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
            Our healthcare professionals are here to guide you to the right service for your needs.
          </p>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button 
              mat-raised-button 
              style="background-color: #0891B2; color: white;"
              (click)="contactUs()"
            >
              <mat-icon style="margin-right: 8px;">email</mat-icon>
              Contact Us
            </button>
            <button 
              mat-stroked-button 
              style="border-color: #0891B2; color: #0891B2;"
              (click)="scheduleConsultation()"
            >
              <mat-icon style="margin-right: 8px;">event</mat-icon>
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HospitalServicesComponent implements OnInit {
  private publicService = inject(PublicService);
  private snackBar = inject(MatSnackBar);

  services$: Observable<HospitalService[]> = this.publicService.getServices().pipe(
    catchError(error => {
      console.error('Error loading services:', error);
      this.error = true;
      return of([]);
    }),
    finalize(() => {
      this.loading = false;
    })
  );

  loading = true;
  error = false;
  searchTerm = '';
  selectedDepartment = '';
  filteredServices: HospitalService[] = [];
  departments: string[] = [];

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.error = false;
    this.services$ = this.publicService.getServices().pipe(
      catchError(error => {
        console.error('Error loading services:', error);
        this.error = true;
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    );

    this.services$.subscribe(services => {
      this.filteredServices = services;
      this.extractDepartments(services);
    });
  }

  extractDepartments(services: HospitalService[]): void {
    const departmentSet = new Set<string>();
    services.forEach(service => {
      if (service.department) {
        departmentSet.add(service.department);
      }
    });
    this.departments = Array.from(departmentSet).sort();
  }

  filterServices(): void {
    this.services$.subscribe(services => {
      this.filteredServices = services.filter(service => {
        const matchesSearch = !this.searchTerm || 
          service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
        
        const matchesDepartment = !this.selectedDepartment || 
          service.department === this.selectedDepartment;
        
        return matchesSearch && matchesDepartment;
      });
    });
  }

  bookService(service: HospitalService): void {
    this.snackBar.open(`Booking service: ${service.name}`, 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to booking page or open booking modal
  }

  contactUs(): void {
    this.snackBar.open('Opening contact form...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to contact page or open contact modal
  }

  scheduleConsultation(): void {
    this.snackBar.open('Opening consultation scheduler...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to consultation booking page
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