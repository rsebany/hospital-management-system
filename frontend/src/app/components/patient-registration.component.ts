import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { PublicService, PatientRegistration } from '../services/public.service';
import { Observable, catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    FormsModule
  ],
  template: `
    <div style="background-color: #F1F5F9; min-height: 100vh; padding: 20px;">
      <div style="max-width: 800px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #0891B2; font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
            Patient Registration
          </h1>
          <p style="color: #666; font-size: 1.2rem;">
            Join our healthcare community and start your journey to better health
          </p>
        </div>

        <!-- Registration Form -->
        <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <mat-card-header style="padding: 20px 20px 0;">
            <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
              Create Your Account
            </mat-card-title>
            <mat-card-subtitle style="color: #666; margin-top: 5px;">
              Please fill in all required fields to complete your registration
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content style="padding: 20px;">
            <form (ngSubmit)="submitRegistration()" #registrationForm="ngForm">
              
              <!-- Personal Information Section -->
              <div style="margin-bottom: 30px;">
                <h3 style="color: #0891B2; font-size: 1.2rem; font-weight: 600; margin-bottom: 20px; border-bottom: 2px solid #E0F2FE; padding-bottom: 10px;">
                  Personal Information
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                  <mat-form-field style="width: 100%;">
                    <mat-label>First Name *</mat-label>
                    <input matInput [(ngModel)]="registrationData.firstName" name="firstName" required>
                    <mat-error *ngIf="registrationForm.controls['firstName']?.errors?.['required']">
                      First name is required
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field style="width: 100%;">
                    <mat-label>Last Name *</mat-label>
                    <input matInput [(ngModel)]="registrationData.lastName" name="lastName" required>
                    <mat-error *ngIf="registrationForm.controls['lastName']?.errors?.['required']">
                      Last name is required
                    </mat-error>
                  </mat-form-field>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                  <mat-form-field style="width: 100%;">
                    <mat-label>Email *</mat-label>
                    <input matInput type="email" [(ngModel)]="registrationData.email" name="email" required>
                    <mat-error *ngIf="registrationForm.controls['email']?.errors?.['required']">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="registrationForm.controls['email']?.errors?.['email']">
                      Please enter a valid email
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field style="width: 100%;">
                    <mat-label>Phone Number</mat-label>
                    <input matInput [(ngModel)]="registrationData.phoneNumber" name="phoneNumber">
                  </mat-form-field>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                  <mat-form-field style="width: 100%;">
                    <mat-label>Date of Birth</mat-label>
                    <input matInput [matDatepicker]="picker" [(ngModel)]="registrationData.dateOfBirth" name="dateOfBirth">
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                  
                  <mat-form-field style="width: 100%;">
                    <mat-label>Gender</mat-label>
                    <mat-select [(ngModel)]="registrationData.gender" name="gender">
                      <mat-option value="male">Male</mat-option>
                      <mat-option value="female">Female</mat-option>
                      <mat-option value="other">Other</mat-option>
                      <mat-option value="prefer_not_to_say">Prefer not to say</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <!-- Address Section -->
              <div style="margin-bottom: 30px;">
                <h3 style="color: #0891B2; font-size: 1.2rem; font-weight: 600; margin-bottom: 20px; border-bottom: 2px solid #E0F2FE; padding-bottom: 10px;">
                  Address Information
                </h3>
                
                <mat-form-field style="width: 100%; margin-bottom: 20px;">
                  <mat-label>Street Address</mat-label>
                  <input matInput [(ngModel)]="registrationData.address!.street" name="street">
                </mat-form-field>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                  <mat-form-field style="width: 100%;">
                    <mat-label>City</mat-label>
                    <input matInput [(ngModel)]="registrationData.address!.city" name="city">
                  </mat-form-field>
                  
                  <mat-form-field style="width: 100%;">
                    <mat-label>State</mat-label>
                    <input matInput [(ngModel)]="registrationData.address!.state" name="state">
                  </mat-form-field>
                  
                  <mat-form-field style="width: 100%;">
                    <mat-label>ZIP Code</mat-label>
                    <input matInput [(ngModel)]="registrationData.address!.zipCode" name="zipCode">
                  </mat-form-field>
                </div>
                
                <mat-form-field style="width: 100%;">
                  <mat-label>Country</mat-label>
                  <input matInput [(ngModel)]="registrationData.address!.country" name="country">
                </mat-form-field>
              </div>

              <!-- Emergency Contact Section -->
              <div style="margin-bottom: 30px;">
                <h3 style="color: #0891B2; font-size: 1.2rem; font-weight: 600; margin-bottom: 20px; border-bottom: 2px solid #E0F2FE; padding-bottom: 10px;">
                  Emergency Contact
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                  <mat-form-field style="width: 100%;">
                    <mat-label>Emergency Contact Name</mat-label>
                    <input matInput [(ngModel)]="registrationData.emergencyContact!.name" name="emergencyName">
                  </mat-form-field>
                  
                  <mat-form-field style="width: 100%;">
                    <mat-label>Relationship</mat-label>
                    <input matInput [(ngModel)]="registrationData.emergencyContact!.relationship" name="emergencyRelationship">
                  </mat-form-field>
                </div>
                
                <mat-form-field style="width: 100%;">
                  <mat-label>Emergency Contact Phone</mat-label>
                  <input matInput [(ngModel)]="registrationData.emergencyContact!.phone" name="emergencyPhone">
                </mat-form-field>
              </div>

              <!-- Insurance Information Section -->
              <div style="margin-bottom: 30px;">
                <h3 style="color: #0891B2; font-size: 1.2rem; font-weight: 600; margin-bottom: 20px; border-bottom: 2px solid #E0F2FE; padding-bottom: 10px;">
                  Insurance Information
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                  <mat-form-field style="width: 100%;">
                    <mat-label>Insurance Provider</mat-label>
                    <input matInput [(ngModel)]="registrationData.insuranceInfo!.provider" name="insuranceProvider">
                  </mat-form-field>
                  
                  <mat-form-field style="width: 100%;">
                    <mat-label>Policy Number</mat-label>
                    <input matInput [(ngModel)]="registrationData.insuranceInfo!.policyNumber" name="policyNumber">
                  </mat-form-field>
                </div>
                
                <mat-form-field style="width: 100%;">
                  <mat-label>Group Number</mat-label>
                  <input matInput [(ngModel)]="registrationData.insuranceInfo!.groupNumber" name="groupNumber">
                </mat-form-field>
              </div>

              <!-- Account Security Section -->
              <div style="margin-bottom: 30px;">
                <h3 style="color: #0891B2; font-size: 1.2rem; font-weight: 600; margin-bottom: 20px; border-bottom: 2px solid #E0F2FE; padding-bottom: 10px;">
                  Account Security
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                  <mat-form-field style="width: 100%;">
                    <mat-label>Password *</mat-label>
                    <input matInput type="password" [(ngModel)]="registrationData.password" name="password" required>
                    <mat-error *ngIf="registrationForm.controls['password']?.errors?.['required']">
                      Password is required
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field style="width: 100%;">
                    <mat-label>Confirm Password *</mat-label>
                    <input matInput type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required>
                    <mat-error *ngIf="confirmPassword && registrationData.password !== confirmPassword">
                      Passwords do not match
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <!-- Terms and Conditions -->
              <div style="margin-bottom: 30px; padding: 20px; background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;">
                <mat-checkbox [(ngModel)]="acceptedTerms" name="acceptedTerms" required style="margin-bottom: 15px;">
                  I agree to the Terms and Conditions and Privacy Policy
                </mat-checkbox>
                <p style="color: #666; font-size: 0.9rem; line-height: 1.5; margin: 0;">
                  By registering, you agree to our terms of service and privacy policy. We are committed to protecting your personal information and ensuring the security of your health data.
                </p>
              </div>

              <!-- Submit Button -->
              <div style="text-align: center;">
                <button 
                  type="submit" 
                  mat-raised-button 
                  style="background-color: #0891B2; color: white; padding: 12px 40px; font-size: 1.1rem;"
                  [disabled]="!registrationForm.valid || !acceptedTerms || submitting || registrationData.password !== confirmPassword"
                >
                  <mat-spinner *ngIf="submitting" style="width: 20px; height: 20px; margin-right: 10px;"></mat-spinner>
                  {{submitting ? 'Creating Account...' : 'Create Account'}}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Login Link -->
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666;">
            Already have an account? 
            <a routerLink="/login" style="color: #0891B2; text-decoration: none; font-weight: 600;">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class PatientRegistrationComponent implements OnInit {
  private publicService = inject(PublicService);
  private snackBar = inject(MatSnackBar);

  registrationData: PatientRegistration = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      groupNumber: ''
    }
  };

  confirmPassword = '';
  acceptedTerms = false;
  submitting = false;

  ngOnInit(): void {
    // Component initialization
  }

  submitRegistration(): void {
    if (!this.validateForm()) {
      return;
    }

    this.submitting = true;
    this.publicService.registerPatient(this.registrationData).subscribe({
      next: (response) => {
        this.snackBar.open('Registration successful! Welcome to Hopitaliko.', 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-success']
        });
        // Navigate to login or dashboard
        this.submitting = false;
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.snackBar.open('Registration failed. Please try again.', 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-error']
        });
        this.submitting = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.registrationData.firstName || !this.registrationData.lastName || 
        !this.registrationData.email || !this.registrationData.password) {
      this.snackBar.open('Please fill in all required fields.', 'Close', { 
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return false;
    }

    if (this.registrationData.password !== this.confirmPassword) {
      this.snackBar.open('Passwords do not match.', 'Close', { 
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return false;
    }

    if (!this.acceptedTerms) {
      this.snackBar.open('Please accept the terms and conditions.', 'Close', { 
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return false;
    }

    return true;
  }
} 