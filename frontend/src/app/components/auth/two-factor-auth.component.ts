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
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-two-factor-auth',
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
    MatStepperModule
  ],
  template: `
    <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <mat-card style="max-width: 500px; width: 100%; border-radius: 16px; box-shadow: 0 20px 40px rgba(8, 145, 178, 0.2); background: #FFFFFF;">
        <div style="text-align: center; padding: 30px 20px 20px;">
          <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(8, 145, 178, 0.3);">
            <mat-icon style="color: white; font-size: 32px;">security</mat-icon>
          </div>
          <h2 style="color: #0891B2; font-size: 1.8rem; font-weight: 600; margin-bottom: 10px;">Two-Factor Authentication</h2>
          <p style="color: #64748B; margin-bottom: 30px;">Add an extra layer of security to your account</p>
        </div>

        <mat-card-content style="padding: 0 30px 30px;">
          <mat-stepper #stepper>
            <!-- Step 1: Setup -->
            <mat-step label="Setup 2FA">
              <div style="padding: 20px 0;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <mat-icon style="font-size: 48px; color: #0891B2; margin-bottom: 15px;">qr_code</mat-icon>
                  <h3 style="color: #0891B2; margin-bottom: 10px;">Scan QR Code</h3>
                  <p style="color: #64748B; margin-bottom: 20px;">
                    Use your authenticator app to scan the QR code below
                  </p>
                </div>

                <!-- QR Code Display -->
                <div *ngIf="qrCodeUrl" style="text-align: center; margin-bottom: 30px;">
                  <img [src]="qrCodeUrl" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #F1F5F9; border-radius: 8px;">
                </div>

                <!-- Manual Entry -->
                <div style="background-color: #F1F5F9; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                  <h4 style="color: #0891B2; margin-bottom: 10px;">Manual Entry</h4>
                  <p style="color: #64748B; font-size: 0.9rem; margin-bottom: 10px;">
                    If you can't scan the QR code, enter this code manually in your authenticator app:
                  </p>
                  <div style="background: white; border: 1px solid #F1F5F9; border-radius: 4px; padding: 10px; font-family: monospace; font-size: 1.1rem; text-align: center; color: #1E293B;">
                    {{secretKey}}
                  </div>
                </div>

                <div style="text-align: center;">
                  <button 
                    mat-raised-button 
                    style="background: #0891B2; color: white; border: none;"
                    (click)="stepper.next()"
                  >
                    Next: Verify Code
                  </button>
                </div>
              </div>
            </mat-step>

            <!-- Step 2: Verification -->
            <mat-step label="Verify Code">
              <div style="padding: 20px 0;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <mat-icon style="font-size: 48px; color: #0891B2; margin-bottom: 15px;">verified_user</mat-icon>
                  <h3 style="color: #0891B2; margin-bottom: 10px;">Enter Verification Code</h3>
                  <p style="color: #64748B; margin-bottom: 20px;">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <form [formGroup]="verificationForm" (ngSubmit)="verifyCode()">
                  <mat-form-field style="width: 100%; margin-bottom: 25px;">
                    <mat-label style="color: #0891B2;">6-Digit Code</mat-label>
                    <input 
                      matInput 
                      formControlName="code" 
                      placeholder="000000"
                      maxlength="6"
                      [errorStateMatcher]="matcher"
                      style="color: #1E293B;"
                    >
                    <mat-icon matSuffix style="color: #0891B2;">lock</mat-icon>
                    <mat-error *ngIf="verificationForm.get('code')?.hasError('required')">
                      Verification code is required
                    </mat-error>
                    <mat-error *ngIf="verificationForm.get('code')?.hasError('pattern')">
                      Please enter a 6-digit code
                    </mat-error>
                  </mat-form-field>

                  <div style="text-align: center;">
                    <button 
                      type="submit" 
                      mat-raised-button 
                      style="background: #0891B2; color: white; border: none;"
                      [disabled]="verificationForm.invalid || verifying"
                    >
                      <mat-spinner *ngIf="verifying" style="width: 20px; height: 20px; margin-right: 10px;"></mat-spinner>
                      {{verifying ? 'Verifying...' : 'Verify & Enable 2FA'}}
                    </button>
                  </div>
                </form>
              </div>
            </mat-step>

            <!-- Step 3: Success -->
            <mat-step label="Complete">
              <div style="padding: 20px 0; text-align: center;">
                <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);">
                  <mat-icon style="color: white; font-size: 40px;">check</mat-icon>
                </div>
                <h3 style="color: #10B981; margin-bottom: 10px;">2FA Enabled Successfully!</h3>
                <p style="color: #64748B; margin-bottom: 30px;">
                  Your account is now protected with two-factor authentication. 
                  You'll need to enter a verification code every time you log in.
                </p>
                <button 
                  mat-raised-button 
                  style="background: #0891B2; color: white; border: none;"
                  (click)="goToProfile()"
                >
                  Continue to Profile
                </button>
              </div>
            </mat-step>
          </mat-stepper>

          <!-- Back to Profile -->
          <div style="text-align: center; margin-top: 25px;">
            <a 
              routerLink="/auth/profile" 
              style="color: #F97316; text-decoration: none; font-weight: 500;"
            >
              ← Back to Profile
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class TwoFactorAuthComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  verificationForm!: FormGroup;
  qrCodeUrl: string = '';
  secretKey: string = '';
  verifying = false;

  // Custom error state matcher
  matcher = {
    isErrorState: (control: any) => {
      return control && control.invalid && (control.dirty || control.touched);
    }
  };

  ngOnInit(): void {
    this.initForm();
    this.setup2FA();
  }

  initForm(): void {
    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  setup2FA(): void {
    this.authService.setup2FA().subscribe({
      next: (response: any) => {
        this.qrCodeUrl = response.qrCodeUrl;
        this.secretKey = response.secretKey;
      },
      error: (error: any) => {
        const errorMessage = error.error?.message || 'Failed to setup 2FA';
        this.snackBar.open(errorMessage, 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-error']
        });
        this.router.navigate(['/auth/profile']);
      }
    });
  }

  verifyCode(): void {
    if (this.verificationForm.valid) {
      this.verifying = true;
      const code = this.verificationForm.value.code;

      this.authService.verify2FA(code).subscribe({
        next: (response: any) => {
          this.verifying = false;
          this.snackBar.open('2FA enabled successfully!', 'Close', { 
            duration: 3000,
            panelClass: ['snackbar-success']
          });
        },
        error: (error: any) => {
          this.verifying = false;
          const errorMessage = error.error?.message || 'Invalid verification code';
          this.snackBar.open(errorMessage, 'Close', { 
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  goToProfile(): void {
    this.router.navigate(['/auth/profile']);
  }
} 