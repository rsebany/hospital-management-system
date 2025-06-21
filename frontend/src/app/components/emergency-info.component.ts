import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { PublicService, EmergencyInfo } from '../services/public.service';
import { Observable, catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-emergency-info',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule
  ],
  template: `
    <div style="background-color: #F1F5F9; min-height: 100vh; padding: 20px;">
      <div style="max-width: 1000px; margin: 0 auto;">
        <!-- Emergency Banner -->
        <div style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; padding: 40px; border-radius: 16px; text-align: center; margin-bottom: 30px; box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);">
          <mat-icon style="font-size: 64px; margin-bottom: 20px; color: #FEE2E2;">warning</mat-icon>
          <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 15px;">Emergency Services</h1>
          <p style="font-size: 1.3rem; margin-bottom: 30px; color: #FEE2E2;">
            Available 24/7 - Call immediately for life-threatening emergencies
          </p>
          <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
            <button 
              mat-raised-button 
              style="background-color: #991B1B; color: white; padding: 15px 30px; font-size: 1.2rem; font-weight: bold;"
              (click)="callEmergency()"
            >
              <mat-icon style="margin-right: 10px; font-size: 24px;">phone</mat-icon>
              Call 911
            </button>
            <button 
              mat-stroked-button 
              style="border-color: white; color: white; padding: 15px 30px; font-size: 1.2rem;"
              (click)="callHospital()"
            >
              <mat-icon style="margin-right: 10px; font-size: 24px;">local_hospital</mat-icon>
              Call Hospital
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" style="text-align: center; padding: 40px;">
          <mat-spinner style="margin: 0 auto;"></mat-spinner>
          <p style="color: #666; margin-top: 20px;">Loading emergency information...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" style="text-align: center; padding: 40px;">
          <mat-icon style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">error_outline</mat-icon>
          <h3 style="color: #DC2626; margin-bottom: 10px;">Unable to load emergency information</h3>
          <p style="color: #666; margin-bottom: 20px;">Please try again or call emergency services directly.</p>
          <button 
            mat-raised-button 
            style="background-color: #0891B2; color: white;"
            (click)="loadEmergencyInfo()"
          >
            Try Again
          </button>
        </div>

        <!-- Emergency Information -->
        <div *ngIf="!loading && !error" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
          
          <!-- Emergency Contacts -->
          <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <mat-card-header style="padding: 20px 20px 0;">
              <mat-card-title style="color: #DC2626; font-size: 1.5rem; font-weight: 600;">
                Emergency Contacts
              </mat-card-title>
            </mat-card-header>
            <mat-card-content style="padding: 20px;">
              <mat-list>
                <mat-list-item *ngIf="emergencyInfo.emergencyNumber" style="padding: 10px 0;">
                  <mat-icon matListItemIcon style="color: #DC2626;">phone</mat-icon>
                  <div matListItemTitle style="color: #333; font-weight: 600;">Emergency</div>
                  <div matListItemLine style="color: #666;">{{emergencyInfo.emergencyNumber}}</div>
                </mat-list-item>
                
                <mat-list-item *ngIf="emergencyInfo.ambulanceNumber" style="padding: 10px 0;">
                  <mat-icon matListItemIcon style="color: #0891B2;">local_ambulance</mat-icon>
                  <div matListItemTitle style="color: #333; font-weight: 600;">Ambulance</div>
                  <div matListItemLine style="color: #666;">{{emergencyInfo.ambulanceNumber}}</div>
                </mat-list-item>
                
                <mat-list-item *ngIf="emergencyInfo.policeNumber" style="padding: 10px 0;">
                  <mat-icon matListItemIcon style="color: #059669;">security</mat-icon>
                  <div matListItemTitle style="color: #333; font-weight: 600;">Police</div>
                  <div matListItemLine style="color: #666;">{{emergencyInfo.policeNumber}}</div>
                </mat-list-item>
                
                <mat-list-item *ngIf="emergencyInfo.fireNumber" style="padding: 10px 0;">
                  <mat-icon matListItemIcon style="color: #F97316;">local_fire_department</mat-icon>
                  <div matListItemTitle style="color: #333; font-weight: 600;">Fire Department</div>
                  <div matListItemLine style="color: #666;">{{emergencyInfo.fireNumber}}</div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>

          <!-- Emergency Departments -->
          <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <mat-card-header style="padding: 20px 20px 0;">
              <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
                Emergency Departments
              </mat-card-title>
            </mat-card-header>
            <mat-card-content style="padding: 20px;">
              <div *ngIf="emergencyInfo.emergencyDepartments && emergencyInfo.emergencyDepartments.length > 0">
                <div 
                  *ngFor="let dept of emergencyInfo.emergencyDepartments" 
                  style="padding: 12px; background-color: #FEF2F2; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #DC2626;"
                >
                  <div style="color: #DC2626; font-weight: 600;">{{dept}}</div>
                </div>
              </div>
              <div *ngIf="!emergencyInfo.emergencyDepartments || emergencyInfo.emergencyDepartments.length === 0" style="color: #666; text-align: center; padding: 20px;">
                <mat-icon style="font-size: 48px; color: #999; margin-bottom: 10px;">info_outline</mat-icon>
                <p>Emergency departments available 24/7</p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Emergency Instructions -->
          <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <mat-card-header style="padding: 20px 20px 0;">
              <mat-card-title style="color: #059669; font-size: 1.5rem; font-weight: 600;">
                Emergency Instructions
              </mat-card-title>
            </mat-card-header>
            <mat-card-content style="padding: 20px;">
              <div *ngIf="emergencyInfo.emergencyInstructions" style="color: #666; line-height: 1.6;">
                {{emergencyInfo.emergencyInstructions}}
              </div>
              <div *ngIf="!emergencyInfo.emergencyInstructions" style="color: #666; line-height: 1.6;">
                <p><strong>In case of emergency:</strong></p>
                <ul style="padding-left: 20px; margin-top: 10px;">
                  <li>Call 911 immediately for life-threatening situations</li>
                  <li>Stay calm and follow emergency operator instructions</li>
                  <li>Do not move seriously injured persons unless necessary</li>
                  <li>Keep emergency contacts readily available</li>
                </ul>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Nearest Hospitals -->
          <mat-card *ngIf="emergencyInfo.nearestHospitals && emergencyInfo.nearestHospitals.length > 0" style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); grid-column: 1 / -1;">
            <mat-card-header style="padding: 20px 20px 0;">
              <mat-card-title style="color: #8B5CF6; font-size: 1.5rem; font-weight: 600;">
                Nearest Hospitals
              </mat-card-title>
            </mat-card-header>
            <mat-card-content style="padding: 20px;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                <div 
                  *ngFor="let hospital of emergencyInfo.nearestHospitals" 
                  style="padding: 15px; background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;"
                >
                  <div style="color: #333; font-weight: 600; margin-bottom: 8px;">{{hospital.name}}</div>
                  <div style="color: #666; margin-bottom: 5px; font-size: 0.9rem;">
                    <mat-icon style="font-size: 16px; margin-right: 5px; vertical-align: middle;">location_on</mat-icon>
                    {{hospital.address}}
                  </div>
                  <div style="color: #666; margin-bottom: 5px; font-size: 0.9rem;">
                    <mat-icon style="font-size: 16px; margin-right: 5px; vertical-align: middle;">phone</mat-icon>
                    {{hospital.phone}}
                  </div>
                  <div *ngIf="hospital.distance" style="color: #0891B2; font-size: 0.9rem; font-weight: 500;">
                    {{hospital.distance}} away
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <div style="margin-top: 30px; background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <h3 style="color: #0891B2; margin-bottom: 20px; font-size: 1.5rem;">Quick Actions</h3>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button 
              mat-raised-button 
              style="background-color: #DC2626; color: white;"
              (click)="callEmergency()"
            >
              <mat-icon style="margin-right: 8px;">phone</mat-icon>
              Emergency (911)
            </button>
            <button 
              mat-raised-button 
              style="background-color: #0891B2; color: white;"
              (click)="callHospital()"
            >
              <mat-icon style="margin-right: 8px;">local_hospital</mat-icon>
              Hospital Emergency
            </button>
            <button 
              mat-stroked-button 
              style="border-color: #059669; color: #059669;"
              (click)="getDirections()"
            >
              <mat-icon style="margin-right: 8px;">directions</mat-icon>
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmergencyInfoComponent implements OnInit {
  private publicService = inject(PublicService);
  private snackBar = inject(MatSnackBar);

  emergencyInfo$: Observable<EmergencyInfo> = this.publicService.getEmergencyInfo().pipe(
    catchError(error => {
      console.error('Error loading emergency info:', error);
      this.error = true;
      return of({} as EmergencyInfo);
    }),
    finalize(() => {
      this.loading = false;
    })
  );

  loading = true;
  error = false;
  emergencyInfo: EmergencyInfo = {
    emergencyNumber: '',
    ambulanceNumber: '',
    policeNumber: '',
    fireNumber: '',
    emergencyDepartments: [],
    emergencyInstructions: '',
    nearestHospitals: []
  };

  ngOnInit(): void {
    this.loadEmergencyInfo();
  }

  loadEmergencyInfo(): void {
    this.loading = true;
    this.error = false;
    this.emergencyInfo$ = this.publicService.getEmergencyInfo().pipe(
      catchError(error => {
        console.error('Error loading emergency info:', error);
        this.error = true;
        return of({} as EmergencyInfo);
      }),
      finalize(() => {
        this.loading = false;
      })
    );

    this.emergencyInfo$.subscribe(info => {
      this.emergencyInfo = info;
    });
  }

  callEmergency(): void {
    this.snackBar.open('Calling 911...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Implement emergency call functionality
    window.open('tel:911', '_self');
  }

  callHospital(): void {
    const hospitalPhone = this.emergencyInfo.emergencyNumber || '(555) 123-4567';
    this.snackBar.open(`Calling hospital emergency: ${hospitalPhone}`, 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Implement hospital call functionality
    window.open(`tel:${hospitalPhone}`, '_self');
  }

  getDirections(): void {
    this.snackBar.open('Opening directions to hospital...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Implement directions functionality
    // window.open('https://maps.google.com/?q=hospital+location', '_blank');
  }
} 