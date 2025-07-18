import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';

interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  insuranceInfo?: {
    provider?: string;
    policyNumber?: string;
    groupNumber?: string;
  };
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div style="background-color: #F1F5F9; min-height: 100vh; padding: 20px;">
      <div style="max-width: 1000px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(8, 145, 178, 0.1);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h1 style="color: #0891B2; font-size: 2rem; font-weight: 600; margin-bottom: 5px;">My Profile</h1>
              <p style="color: #64748B;">Manage your account information and settings</p>
            </div>
            <div style="display: flex; gap: 10px;">
              <button 
                mat-stroked-button 
                style="border-color: #0891B2; color: #0891B2;"
                (click)="goBack()"
              >
                <mat-icon style="margin-right: 5px;">arrow_back</mat-icon>
                Back
              </button>
              <button 
                mat-raised-button 
                style="background: #F97316; color: white; border: none;"
                (click)="logout()"
              >
                <mat-icon style="margin-right: 5px;">logout</mat-icon>
                Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" style="text-align: center; padding: 40px;">
          <mat-spinner style="margin: 0 auto;"></mat-spinner>
          <p style="color: #64748B; margin-top: 20px;">Loading profile information...</p>
        </div>

        <!-- Profile Content -->
        <div *ngIf="!loading && userProfile" style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px;">
          <!-- Profile Card -->
          <mat-card style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(8, 145, 178, 0.1); height: fit-content;">
            <mat-card-content style="padding: 30px; text-align: center;">
              <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(8, 145, 178, 0.3);">
                <mat-icon style="color: white; font-size: 40px;">person</mat-icon>
              </div>
              <h2 style="color: #0891B2; font-size: 1.5rem; font-weight: 600; margin-bottom: 10px;">
                {{userProfile.firstName}} {{userProfile.lastName}}
              </h2>
              <p style="color: #64748B; margin-bottom: 15px;">{{userProfile.email}}</p>
              <mat-chip-set>
                <mat-chip style="background-color: #E0F2FE; color: #0891B2;">
                  {{userProfile.role | titlecase}}
                </mat-chip>
                <mat-chip *ngIf="userProfile.isEmailVerified" style="background-color: #ECFDF5; color: #10B981;">
                  <mat-icon style="font-size: 16px; margin-right: 5px;">verified</mat-icon>
                  Verified
                </mat-chip>
                <mat-chip *ngIf="!userProfile.isEmailVerified" style="background-color: #FEF3C7; color: #F59E0B;">
                  <mat-icon style="font-size: 16px; margin-right: 5px;">warning</mat-icon>
                  Unverified
                </mat-chip>
              </mat-chip-set>
              
              <mat-divider style="margin: 20px 0;"></mat-divider>
              
              <div style="text-align: left;">
                <div style="margin-bottom: 15px;">
                  <div style="color: #64748B; font-size: 0.9rem;">Member Since</div>
                  <div style="color: #1E293B; font-weight: 500;">{{userProfile.createdAt | date:'MMM yyyy'}}</div>
                </div>
                <div *ngIf="userProfile.lastLogin">
                  <div style="color: #64748B; font-size: 0.9rem;">Last Login</div>
                  <div style="color: #1E293B; font-weight: 500;">{{userProfile.lastLogin | date:'MMM dd, yyyy'}}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Profile Details -->
          <mat-card style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(8, 145, 178, 0.1);">
            <mat-card-content style="padding: 30px;">
              <mat-tab-group>
                <!-- Personal Information Tab -->
                <mat-tab label="Personal Information">
                  <div style="padding: 20px 0;">
                    <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <mat-form-field>
                          <mat-label style="color: #0891B2;">First Name</mat-label>
                          <input matInput formControlName="firstName" style="color: #1E293B;">
                          <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                            First name is required
                          </mat-error>
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label style="color: #0891B2;">Last Name</mat-label>
                          <input matInput formControlName="lastName" style="color: #1E293B;">
                          <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                            Last name is required
                          </mat-error>
                        </mat-form-field>
                      </div>

                      <mat-form-field style="width: 100%; margin-bottom: 20px;">
                        <mat-label style="color: #0891B2;">Email</mat-label>
                        <input matInput formControlName="email" readonly style="color: #1E293B;">
                        <mat-icon matSuffix style="color: #0891B2;">email</mat-icon>
                      </mat-form-field>

                      <mat-form-field style="width: 100%; margin-bottom: 20px;">
                        <mat-label style="color: #0891B2;">Phone Number</mat-label>
                        <input matInput formControlName="phoneNumber" style="color: #1E293B;">
                        <mat-icon matSuffix style="color: #0891B2;">phone</mat-icon>
                      </mat-form-field>

                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <mat-form-field>
                          <mat-label style="color: #0891B2;">Date of Birth</mat-label>
                          <input matInput type="date" formControlName="dateOfBirth" style="color: #1E293B;">
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label style="color: #0891B2;">Gender</mat-label>
                          <input matInput formControlName="gender" style="color: #1E293B;">
                        </mat-form-field>
                      </div>

                      <div style="text-align: right;">
                        <button 
                          type="submit" 
                          mat-raised-button 
                          style="background: #0891B2; color: white; border: none;"
                          [disabled]="profileForm.invalid || updating"
                        >
                          <mat-spinner *ngIf="updating" style="width: 20px; height: 20px; margin-right: 10px;"></mat-spinner>
                          {{updating ? 'Updating...' : 'Update Profile'}}
                        </button>
                      </div>
                    </form>
                  </div>
                </mat-tab>

                <!-- Address Tab -->
                <mat-tab label="Address">
                  <div style="padding: 20px 0;">
                    <form [formGroup]="addressForm" (ngSubmit)="updateAddress()">
                      <mat-form-field style="width: 100%; margin-bottom: 20px;">
                        <mat-label>Street Address</mat-label>
                        <input matInput formControlName="street">
                      </mat-form-field>

                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <mat-form-field>
                          <mat-label>City</mat-label>
                          <input matInput formControlName="city">
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label>State</mat-label>
                          <input matInput formControlName="state">
                        </mat-form-field>
                      </div>

                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <mat-form-field>
                          <mat-label>ZIP Code</mat-label>
                          <input matInput formControlName="zipCode">
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label>Country</mat-label>
                          <input matInput formControlName="country">
                        </mat-form-field>
                      </div>

                      <div style="text-align: right;">
                        <button 
                          type="submit" 
                          mat-raised-button 
                          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"
                          [disabled]="addressForm.invalid || updating"
                        >
                          <mat-spinner *ngIf="updating" style="width: 20px; height: 20px; margin-right: 10px;"></mat-spinner>
                          {{updating ? 'Updating...' : 'Update Address'}}
                        </button>
                      </div>
                    </form>
                  </div>
                </mat-tab>

                <!-- Security Tab -->
                <mat-tab label="Security">
                  <div style="padding: 20px 0;">
                    <div style="margin-bottom: 30px;">
                      <h3 style="color: #333; margin-bottom: 15px;">Change Password</h3>
                      <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                        <mat-form-field style="width: 100%; margin-bottom: 20px;">
                          <mat-label>Current Password</mat-label>
                          <input matInput type="password" formControlName="currentPassword">
                          <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                            Current password is required
                          </mat-error>
                        </mat-form-field>

                        <mat-form-field style="width: 100%; margin-bottom: 20px;">
                          <mat-label>New Password</mat-label>
                          <input matInput type="password" formControlName="newPassword">
                          <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                            New password is required
                          </mat-error>
                          <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                            Password must be at least 8 characters
                          </mat-error>
                        </mat-form-field>

                        <mat-form-field style="width: 100%; margin-bottom: 20px;">
                          <mat-label>Confirm New Password</mat-label>
                          <input matInput type="password" formControlName="confirmPassword">
                          <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                            Please confirm your password
                          </mat-error>
                        </mat-form-field>

                        <div style="text-align: right;">
                          <button 
                            type="submit" 
                            mat-raised-button 
                            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"
                            [disabled]="passwordForm.invalid || changingPassword"
                          >
                            <mat-spinner *ngIf="changingPassword" style="width: 20px; height: 20px; margin-right: 10px;"></mat-spinner>
                            {{changingPassword ? 'Changing...' : 'Change Password'}}
                          </button>
                        </div>
                      </form>
                    </div>

                    <mat-divider style="margin: 30px 0;"></mat-divider>

                    <div>
                      <h3 style="color: #333; margin-bottom: 15px;">Two-Factor Authentication</h3>
                      <p style="color: #666; margin-bottom: 20px;">Add an extra layer of security to your account.</p>
                      <button 
                        mat-raised-button 
                        style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white;"
                        (click)="enable2FA()"
                      >
                        <mat-icon style="margin-right: 5px;">security</mat-icon>
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </mat-tab>
              </mat-tab-group>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  userProfile: UserProfile | null = null;
  loading = true;
  updating = false;
  changingPassword = false;

  profileForm!: FormGroup;
  addressForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      dateOfBirth: [''],
      gender: ['']
    });

    this.addressForm = this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (profile: any) => {
        this.userProfile = profile;
        this.populateForms();
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.snackBar.open('Failed to load profile', 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  populateForms(): void {
    if (this.userProfile) {
      this.profileForm.patchValue({
        firstName: this.userProfile.firstName,
        lastName: this.userProfile.lastName,
        email: this.userProfile.email,
        phoneNumber: this.userProfile.phoneNumber || '',
        dateOfBirth: this.userProfile.dateOfBirth || '',
        gender: this.userProfile.gender || ''
      });

      this.addressForm.patchValue({
        street: this.userProfile.address?.street || '',
        city: this.userProfile.address?.city || '',
        state: this.userProfile.address?.state || '',
        zipCode: this.userProfile.address?.zipCode || '',
        country: this.userProfile.address?.country || ''
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.updating = true;
      this.authService.updateProfile(this.profileForm.value).subscribe({
        next: (response: any) => {
          this.updating = false;
          this.snackBar.open('Profile updated successfully!', 'Close', { 
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.loadProfile();
        },
        error: (error: any) => {
          this.updating = false;
          const errorMessage = error.error?.message || 'Failed to update profile';
          this.snackBar.open(errorMessage, 'Close', { 
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  updateAddress(): void {
    if (this.addressForm.valid) {
      this.updating = true;
      this.authService.updateAddress(this.addressForm.value).subscribe({
        next: (response: any) => {
          this.updating = false;
          this.snackBar.open('Address updated successfully!', 'Close', { 
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.loadProfile();
        },
        error: (error: any) => {
          this.updating = false;
          const errorMessage = error.error?.message || 'Failed to update address';
          this.snackBar.open(errorMessage, 'Close', { 
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.changingPassword = true;
      const passwordData = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword
      };

      this.authService.changePassword(passwordData).subscribe({
        next: (response: any) => {
          this.changingPassword = false;
          this.snackBar.open('Password changed successfully!', 'Close', { 
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.passwordForm.reset();
        },
        error: (error: any) => {
          this.changingPassword = false;
          const errorMessage = error.error?.message || 'Failed to change password';
          this.snackBar.open(errorMessage, 'Close', { 
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  enable2FA(): void {
    this.authService.enable2FA().subscribe({
      next: (response: any) => {
        this.snackBar.open('2FA setup initiated. Please check your email for instructions.', 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-success']
        });
      },
      error: (error: any) => {
        const errorMessage = error.error?.message || 'Failed to enable 2FA';
        this.snackBar.open(errorMessage, 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logoutLocal();
    this.router.navigate(['/auth/login']);
  }
}
