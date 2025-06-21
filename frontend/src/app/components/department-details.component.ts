import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { PublicService, Department, Doctor } from '../services/public.service';
import { Observable, catchError, of, finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-department-details',
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
    MatListModule
  ],
  template: `
    <div style="background-color: #F1F5F9; min-height: 100vh; padding: 20px;">
      <div style="max-width: 1200px; margin: 0 auto;">
        
        <!-- Loading State -->
        <div *ngIf="loading" style="text-align: center; padding: 40px;">
          <mat-spinner style="margin: 0 auto;"></mat-spinner>
          <p style="color: #666; margin-top: 20px;">Loading department information...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" style="text-align: center; padding: 40px;">
          <mat-icon style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">error_outline</mat-icon>
          <h3 style="color: #DC2626; margin-bottom: 10px;">Unable to load department</h3>
          <p style="color: #666; margin-bottom: 20px;">Please try again or contact us for assistance.</p>
          <button 
            mat-raised-button 
            style="background-color: #0891B2; color: white;"
            (click)="loadDepartment()"
          >
            Try Again
          </button>
        </div>

        <!-- Department Information -->
        <div *ngIf="!loading && !error && (department$ | async) as department">
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); color: white; padding: 40px; border-radius: 16px; text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 15px;">{{department.name}}</h1>
            <p style="font-size: 1.3rem; margin-bottom: 20px; color: #E0F2FE;">{{department.description}}</p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
              <button 
                mat-raised-button 
                style="background-color: #F97316; color: white;"
                (click)="bookAppointment()"
              >
                <mat-icon style="margin-right: 8px;">schedule</mat-icon>
                Book Appointment
              </button>
              <button 
                mat-stroked-button 
                style="border-color: white; color: white;"
                (click)="contactDepartment()"
              >
                <mat-icon style="margin-right: 8px;">phone</mat-icon>
                Contact Department
              </button>
            </div>
          </div>

          <!-- Department Details Grid -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 40px;">
            
            <!-- Main Content -->
            <div>
              <!-- Services Section -->
              <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
                <mat-card-header style="padding: 20px 20px 0;">
                  <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
                    Our Services
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <div *ngIf="department.services && department.services.length > 0">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                      <div 
                        *ngFor="let service of department.services" 
                        style="padding: 15px; background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;"
                      >
                        <div style="display: flex; align-items: center;">
                          <mat-icon style="color: #0891B2; margin-right: 10px;">medical_services</mat-icon>
                          <span style="color: #333; font-weight: 500;">{{service}}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="!department.services || department.services.length === 0" style="text-align: center; padding: 20px; color: #666;">
                    <mat-icon style="font-size: 48px; color: #999; margin-bottom: 10px;">info_outline</mat-icon>
                    <p>Services information coming soon</p>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Department Staff -->
              <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <mat-card-header style="padding: 20px 20px 0;">
                  <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
                    Department Staff
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <div *ngIf="departmentDoctors$ | async as doctors">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                      <div 
                        *ngFor="let doctor of doctors" 
                        style="padding: 20px; background-color: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; text-align: center; transition: transform 0.2s; cursor: pointer;"
                        (mouseenter)="onCardHover($event)"
                        (mouseleave)="onCardLeave($event)"
                        (click)="viewDoctor(doctor)"
                      >
                        <img 
                          *ngIf="doctor.imageUrl" 
                          [src]="doctor.imageUrl" 
                          [alt]="doctor.firstName + ' ' + doctor.lastName"
                          style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 0 auto 15px;"
                        />
                        <div *ngIf="!doctor.imageUrl" style="width: 80px; height: 80px; border-radius: 50%; background-color: #E0F2FE; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                          <mat-icon style="color: #0891B2; font-size: 32px;">person</mat-icon>
                        </div>
                        <h4 style="color: #0891B2; font-weight: 600; margin-bottom: 5px;">{{doctor.firstName}} {{doctor.lastName}}</h4>
                        <p style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">{{doctor.specialization}}</p>
                        <div style="color: #666; font-size: 0.8rem;">
                          <div>Experience: {{doctor.experience}} years</div>
                          <div *ngIf="doctor.availability">Available: {{doctor.availability}}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Sidebar -->
            <div>
              <!-- Contact Information -->
              <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
                <mat-card-header style="padding: 20px 20px 0;">
                  <mat-card-title style="color: #0891B2; font-size: 1.3rem; font-weight: 600;">
                    Contact Information
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <mat-list>
                    <mat-list-item *ngIf="department.headDoctor" style="padding: 10px 0;">
                      <mat-icon matListItemIcon style="color: #0891B2;">person</mat-icon>
                      <div matListItemTitle style="color: #333; font-weight: 600;">Head Doctor</div>
                      <div matListItemLine style="color: #666;">{{department.headDoctor}}</div>
                    </mat-list-item>
                    
                    <mat-list-item *ngIf="department.phone" style="padding: 10px 0;">
                      <mat-icon matListItemIcon style="color: #0891B2;">phone</mat-icon>
                      <div matListItemTitle style="color: #333; font-weight: 600;">Phone</div>
                      <div matListItemLine style="color: #666;">{{department.phone}}</div>
                    </mat-list-item>
                    
                    <mat-list-item *ngIf="department.email" style="padding: 10px 0;">
                      <mat-icon matListItemIcon style="color: #0891B2;">email</mat-icon>
                      <div matListItemTitle style="color: #333; font-weight: 600;">Email</div>
                      <div matListItemLine style="color: #666;">{{department.email}}</div>
                    </mat-list-item>
                    
                    <mat-list-item *ngIf="department.location" style="padding: 10px 0;">
                      <mat-icon matListItemIcon style="color: #0891B2;">location_on</mat-icon>
                      <div matListItemTitle style="color: #333; font-weight: 600;">Location</div>
                      <div matListItemLine style="color: #666;">{{department.location}}</div>
                    </mat-list-item>
                  </mat-list>
                </mat-card-content>
              </mat-card>

              <!-- Quick Actions -->
              <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <mat-card-header style="padding: 20px 20px 0;">
                  <mat-card-title style="color: #0891B2; font-size: 1.3rem; font-weight: 600;">
                    Quick Actions
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button 
                      mat-raised-button 
                      style="background-color: #0891B2; color: white;"
                      (click)="bookAppointment()"
                    >
                      <mat-icon style="margin-right: 8px;">schedule</mat-icon>
                      Book Appointment
                    </button>
                    <button 
                      mat-stroked-button 
                      style="border-color: #0891B2; color: #0891B2;"
                      (click)="contactDepartment()"
                    >
                      <mat-icon style="margin-right: 8px;">phone</mat-icon>
                      Call Department
                    </button>
                    <button 
                      mat-stroked-button 
                      style="border-color: #0891B2; color: #0891B2;"
                      (click)="getDirections()"
                    >
                      <mat-icon style="margin-right: 8px;">directions</mat-icon>
                      Get Directions
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DepartmentDetailsComponent implements OnInit {
  private publicService = inject(PublicService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  department$: Observable<Department> = this.route.params.pipe(
    switchMap((params: any) => {
      const id = params['id'];
      return this.publicService.getDepartmentDetails(id).pipe(
        catchError(error => {
          console.error('Error loading department:', error);
          this.error = true;
          return of({} as Department);
        }),
        finalize(() => {
          this.loading = false;
        })
      );
    })
  );

  departmentDoctors$: Observable<Doctor[]> = this.route.params.pipe(
    switchMap((params: any) => {
      const id = params['id'];
      return this.publicService.getDoctors({ department: id }).pipe(
        catchError(error => {
          console.error('Error loading department doctors:', error);
          return of([]);
        })
      );
    })
  );

  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadDepartment();
  }

  loadDepartment(): void {
    this.loading = true;
    this.error = false;
    this.department$ = this.route.params.pipe(
      switchMap((params: any) => {
        const id = params['id'];
        return this.publicService.getDepartmentDetails(id).pipe(
          catchError(error => {
            console.error('Error loading department:', error);
            this.error = true;
            return of({} as Department);
          }),
          finalize(() => {
            this.loading = false;
          })
        );
      })
    );
  }

  bookAppointment(): void {
    this.snackBar.open('Opening appointment booking...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to appointment booking page
  }

  contactDepartment(): void {
    this.snackBar.open('Opening contact form...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to contact page or open contact modal
  }

  getDirections(): void {
    this.snackBar.open('Opening directions...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Open maps with department location
  }

  viewDoctor(doctor: Doctor): void {
    this.snackBar.open(`Viewing doctor: ${doctor.firstName} ${doctor.lastName}`, 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to doctor details page
  }

  onCardHover(event: any): void {
    event.target.style.transform = 'translateY(-4px)';
    event.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
  }

  onCardLeave(event: any): void {
    event.target.style.transform = 'translateY(0)';
    event.target.style.boxShadow = 'none';
  }
} 