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
import { MatDividerModule } from '@angular/material/divider';
import { PublicService, Doctor } from '../services/public.service';
import { Observable, catchError, of, finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-doctor-details',
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
    MatListModule,
    MatDividerModule
  ],
  template: `
    <div style="background-color: #F1F5F9; min-height: 100vh; padding: 20px;">
      <div style="max-width: 1200px; margin: 0 auto;">
        
        <!-- Loading State -->
        <div *ngIf="loading" style="text-align: center; padding: 40px;">
          <mat-spinner style="margin: 0 auto;"></mat-spinner>
          <p style="color: #666; margin-top: 20px;">Loading doctor information...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" style="text-align: center; padding: 40px;">
          <mat-icon style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">error_outline</mat-icon>
          <h3 style="color: #DC2626; margin-bottom: 10px;">Unable to load doctor information</h3>
          <p style="color: #666; margin-bottom: 20px;">Please try again or contact us for assistance.</p>
          <button 
            mat-raised-button 
            style="background-color: #0891B2; color: white;"
            (click)="loadDoctor()"
          >
            Try Again
          </button>
        </div>

        <!-- Doctor Information -->
        <div *ngIf="!loading && !error && (doctor$ | async) as doctor">
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); color: white; padding: 40px; border-radius: 16px; margin-bottom: 30px;">
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 30px; align-items: center;">
              <!-- Doctor Image -->
              <div style="text-align: center;">
                <img 
                  *ngIf="doctor.imageUrl" 
                  [src]="doctor.imageUrl" 
                  [alt]="doctor.firstName + ' ' + doctor.lastName"
                  style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid white;"
                />
                <div *ngIf="!doctor.imageUrl" style="width: 150px; height: 150px; border-radius: 50%; background-color: #E0F2FE; display: flex; align-items: center; justify-content: center; border: 4px solid white; margin: 0 auto;">
                  <mat-icon style="color: #0891B2; font-size: 64px;">person</mat-icon>
                </div>
              </div>
              
              <!-- Doctor Info -->
              <div>
                <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">{{doctor.firstName}} {{doctor.lastName}}</h1>
                <p style="font-size: 1.3rem; margin-bottom: 15px; color: #E0F2FE;">{{doctor.specialization}}</p>
                <p *ngIf="doctor.department" style="font-size: 1.1rem; margin-bottom: 20px; color: #E0F2FE;">{{doctor.department}} Department</p>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
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
                    (click)="contactDoctor()"
                  >
                    <mat-icon style="margin-right: 8px;">phone</mat-icon>
                    Contact Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Doctor Details Grid -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 40px;">
            
            <!-- Main Content -->
            <div>
              <!-- About Doctor -->
              <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
                <mat-card-header style="padding: 20px 20px 0;">
                  <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
                    About Dr. {{doctor.lastName}}
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="text-align: center; padding: 20px; background-color: #F8FAFC; border-radius: 8px;">
                      <mat-icon style="color: #0891B2; font-size: 32px; margin-bottom: 10px;">school</mat-icon>
                      <div style="color: #333; font-weight: 600; margin-bottom: 5px;">Education</div>
                      <div style="color: #666; font-size: 0.9rem;">{{doctor.education || 'Information not available'}}</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background-color: #F8FAFC; border-radius: 8px;">
                      <mat-icon style="color: #0891B2; font-size: 32px; margin-bottom: 10px;">work</mat-icon>
                      <div style="color: #333; font-weight: 600; margin-bottom: 5px;">Experience</div>
                      <div style="color: #666; font-size: 0.9rem;">{{doctor.experience}} years</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background-color: #F8FAFC; border-radius: 8px;">
                      <mat-icon style="color: #0891B2; font-size: 32px; margin-bottom: 10px;">schedule</mat-icon>
                      <div style="color: #333; font-weight: 600; margin-bottom: 5px;">Availability</div>
                      <div style="color: #666; font-size: 0.9rem;">{{doctor.availability || 'Contact for availability'}}</div>
                    </div>
                  </div>
                  
                  <mat-divider style="margin: 20px 0;"></mat-divider>
                  
                  <div>
                    <h4 style="color: #0891B2; font-weight: 600; margin-bottom: 15px;">Specializations</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                      <span 
                        style="background-color: #E0F2FE; color: #0891B2; padding: 8px 16px; border-radius: 20px; font-weight: 500;"
                      >
                        {{doctor.specialization}}
                      </span>
                      <span 
                        *ngIf="doctor.department"
                        style="background-color: #FEF3C7; color: #D97706; padding: 8px 16px; border-radius: 20px; font-weight: 500;"
                      >
                        {{doctor.department}}
                      </span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Services Offered -->
              <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <mat-card-header style="padding: 20px 20px 0;">
                  <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
                    Services Offered
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div style="padding: 15px; background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;">
                      <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <mat-icon style="color: #0891B2; margin-right: 10px;">medical_services</mat-icon>
                        <span style="color: #333; font-weight: 600;">Consultation</span>
                      </div>
                      <p style="color: #666; font-size: 0.9rem; margin: 0;">Comprehensive medical consultation and examination</p>
                    </div>
                    <div style="padding: 15px; background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;">
                      <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <mat-icon style="color: #0891B2; margin-right: 10px;">healing</mat-icon>
                        <span style="color: #333; font-weight: 600;">Treatment</span>
                      </div>
                      <p style="color: #666; font-size: 0.9rem; margin: 0;">Specialized treatment plans and procedures</p>
                    </div>
                    <div style="padding: 15px; background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;">
                      <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <mat-icon style="color: #0891B2; margin-right: 10px;">monitor_heart</mat-icon>
                        <span style="color: #333; font-weight: 600;">Follow-up</span>
                      </div>
                      <p style="color: #666; font-size: 0.9rem; margin: 0;">Regular follow-up appointments and monitoring</p>
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
                    <mat-list-item *ngIf="doctor.email" style="padding: 10px 0;">
                      <mat-icon matListItemIcon style="color: #0891B2;">email</mat-icon>
                      <div matListItemTitle style="color: #333; font-weight: 600;">Email</div>
                      <div matListItemLine style="color: #666;">{{doctor.email}}</div>
                    </mat-list-item>
                    
                    <mat-list-item *ngIf="doctor.phone" style="padding: 10px 0;">
                      <mat-icon matListItemIcon style="color: #0891B2;">phone</mat-icon>
                      <div matListItemTitle style="color: #333; font-weight: 600;">Phone</div>
                      <div matListItemLine style="color: #666;">{{doctor.phone}}</div>
                    </mat-list-item>
                    
                    <mat-list-item *ngIf="doctor.department" style="padding: 10px 0;">
                      <mat-icon matListItemIcon style="color: #0891B2;">business</mat-icon>
                      <div matListItemTitle style="color: #333; font-weight: 600;">Department</div>
                      <div matListItemLine style="color: #666;">{{doctor.department}}</div>
                    </mat-list-item>
                    
                    <mat-list-item *ngIf="doctor.availability" style="padding: 10px 0;">
                      <mat-icon matListItemIcon style="color: #0891B2;">schedule</mat-icon>
                      <div matListItemTitle style="color: #333; font-weight: 600;">Availability</div>
                      <div matListItemLine style="color: #666;">{{doctor.availability}}</div>
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
                      (click)="contactDoctor()"
                    >
                      <mat-icon style="margin-right: 8px;">phone</mat-icon>
                      Call Doctor
                    </button>
                    <button 
                      mat-stroked-button 
                      style="border-color: #0891B2; color: #0891B2;"
                      (click)="sendMessage()"
                    >
                      <mat-icon style="margin-right: 8px;">email</mat-icon>
                      Send Message
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
export class DoctorDetailsComponent implements OnInit {
  private publicService = inject(PublicService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  doctor$: Observable<Doctor> = this.route.params.pipe(
    switchMap((params: any) => {
      const id = params['id'];
      return this.publicService.getDoctorDetails(id).pipe(
        catchError(error => {
          console.error('Error loading doctor:', error);
          this.error = true;
          return of({} as Doctor);
        }),
        finalize(() => {
          this.loading = false;
        })
      );
    })
  );

  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadDoctor();
  }

  loadDoctor(): void {
    this.loading = true;
    this.error = false;
    this.doctor$ = this.route.params.pipe(
      switchMap((params: any) => {
        const id = params['id'];
        return this.publicService.getDoctorDetails(id).pipe(
          catchError(error => {
            console.error('Error loading doctor:', error);
            this.error = true;
            return of({} as Doctor);
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

  contactDoctor(): void {
    this.snackBar.open('Opening contact form...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to contact page or open contact modal
  }

  sendMessage(): void {
    this.snackBar.open('Opening message form...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Open message form or navigate to messaging page
  }
} 