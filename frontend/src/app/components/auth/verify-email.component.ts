import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
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
    <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <mat-card style="max-width: 400px; width: 100%; border-radius: 16px; box-shadow: 0 20px 40px rgba(8, 145, 178, 0.2); background: #FFFFFF;">
        <div style="text-align: center; padding: 30px 20px 20px;">
          <div *ngIf="!loading && !error && !success" style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(8, 145, 178, 0.3);">
            <mat-icon style="color: white; font-size: 32px;">email</mat-icon>
          </div>
          
          <div *ngIf="loading" style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(8, 145, 178, 0.3);">
            <mat-spinner style="width: 30px; height: 30px; color: white;"></mat-spinner>
          </div>
          
          <div *ngIf="success" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);">
            <mat-icon style="color: white; font-size: 32px;">check</mat-icon>
          </div>
          
          <div *ngIf="error" style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);">
            <mat-icon style="color: white; font-size: 32px;">error</mat-icon>
          </div>

          <h2 style="color: #0891B2; font-size: 1.8rem; font-weight: 600; margin-bottom: 10px;">
            <span *ngIf="!loading && !error && !success">Email Verification</span>
            <span *ngIf="loading">Verifying Email...</span>
            <span *ngIf="success" style="color: #10B981;">Email Verified!</span>
            <span *ngIf="error" style="color: #EF4444;">Verification Failed</span>
          </h2>
          
          <p style="color: #64748B; margin-bottom: 30px;">
            <span *ngIf="!loading && !error && !success">Please wait while we verify your email address...</span>
            <span *ngIf="loading">Please wait while we verify your email address...</span>
            <span *ngIf="success">Your email has been successfully verified!</span>
            <span *ngIf="error">The verification link is invalid or has expired.</span>
          </p>
        </div>

        <mat-card-content style="padding: 0 30px 30px;">
          <!-- Loading State -->
          <div *ngIf="loading" style="text-align: center;">
            <mat-spinner style="margin: 0 auto 20px;"></mat-spinner>
            <p style="color: #64748B;">Verifying your email address...</p>
          </div>

          <!-- Success State -->
          <div *ngIf="success" style="text-align: center;">
            <div style="background-color: #ECFDF5; border: 1px solid #10B981; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <mat-icon style="color: #10B981; font-size: 48px; margin-bottom: 10px;">check_circle</mat-icon>
              <h3 style="color: #10B981; margin-bottom: 10px;">Verification Successful!</h3>
              <p style="color: #64748B;">Your email address has been verified. You can now access your account.</p>
            </div>
            <button 
              mat-raised-button 
              style="width: 100%; height: 48px; background: #0891B2; color: white; font-size: 1.1rem; font-weight: 500; border-radius: 8px; border: none;"
              (click)="goToLogin()"
            >
              Continue to Login
            </button>
          </div>

          <!-- Error State -->
          <div *ngIf="error" style="text-align: center;">
            <div style="background-color: #FEF2F2; border: 1px solid #EF4444; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <mat-icon style="color: #EF4444; font-size: 48px; margin-bottom: 10px;">error_outline</mat-icon>
              <h3 style="color: #EF4444; margin-bottom: 10px;">Verification Failed</h3>
              <p style="color: #64748B;">The verification link is invalid or has expired. Please request a new verification email.</p>
            </div>
            <div style="display: flex; gap: 10px;">
              <button 
                mat-stroked-button 
                style="flex: 1; height: 48px; border-color: #0891B2; color: #0891B2; font-size: 1rem; border-radius: 8px;"
                (click)="goToLogin()"
              >
                Go to Login
              </button>
              <button 
                mat-raised-button 
                style="flex: 1; height: 48px; background: #F97316; color: white; font-size: 1rem; font-weight: 500; border-radius: 8px; border: none;"
                (click)="resendVerification()"
              >
                Resend Email
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  loading = true;
  success = false;
  error = false;
  token: string = '';

  ngOnInit(): void {
    this.getTokenFromRoute();
  }

  getTokenFromRoute(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.verifyEmail();
      } else {
        this.error = true;
        this.loading = false;
        this.snackBar.open('Invalid verification link.', 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  verifyEmail(): void {
    this.authService.verifyEmail(this.token).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = true;
        this.snackBar.open('Email verified successfully!', 'Close', { 
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      },
      error: (error: any) => {
        this.loading = false;
        this.error = true;
        const errorMessage = error.error?.message || 'Email verification failed.';
        this.snackBar.open(errorMessage, 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  resendVerification(): void {
    // This would typically require the user's email, so we redirect to login
    this.router.navigate(['/auth/login']);
    this.snackBar.open('Please login to request a new verification email.', 'Close', { 
      duration: 5000,
      panelClass: ['snackbar-info']
    });
  }
} 