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
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
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
    MatSnackBarModule
  ],
  template: `
    <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <mat-card style="max-width: 400px; width: 100%; border-radius: 16px; box-shadow: 0 20px 40px rgba(8, 145, 178, 0.2); background: #FFFFFF;">
        <div style="text-align: center; padding: 30px 20px 20px;">
          <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(8, 145, 178, 0.3);">
            <mat-icon style="color: white; font-size: 32px;">lock_reset</mat-icon>
          </div>
          <h2 style="color: #0891B2; font-size: 1.8rem; font-weight: 600; margin-bottom: 10px;">Forgot Password?</h2>
          <p style="color: #64748B; margin-bottom: 30px;">Enter your email to receive reset instructions</p>
        </div>

        <mat-card-content style="padding: 0 30px 30px;">
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            <!-- Email Field -->
            <mat-form-field style="width: 100%; margin-bottom: 25px;">
              <mat-label style="color: #0891B2;">Email Address</mat-label>
              <input 
                matInput 
                type="email" 
                formControlName="email" 
                placeholder="Enter your email address"
                [errorStateMatcher]="matcher"
                style="color: #1E293B;"
              >
              <mat-icon matSuffix style="color: #0891B2;">email</mat-icon>
              <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <!-- Submit Button -->
            <button 
              type="submit" 
              mat-raised-button 
              style="width: 100%; height: 48px; background: #0891B2; color: white; font-size: 1.1rem; font-weight: 500; border-radius: 8px; border: none;"
              [disabled]="forgotPasswordForm.invalid || loading"
            >
              <mat-spinner *ngIf="loading" style="width: 20px; height: 20px; margin-right: 10px;"></mat-spinner>
              {{loading ? 'Sending...' : 'Send Reset Link'}}
            </button>
          </form>

          <!-- Back to Login -->
          <div style="text-align: center; margin-top: 25px;">
            <a 
              routerLink="/auth/login" 
              style="color: #F97316; text-decoration: none; font-weight: 500;"
            >
              ← Back to Login
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ForgotPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  forgotPasswordForm!: FormGroup;
  loading = false;

  // Custom error state matcher
  matcher = {
    isErrorState: (control: any) => {
      return control && control.invalid && (control.dirty || control.touched);
    }
  };

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      const email = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Password reset link sent to your email!', 'Close', { 
            duration: 5000,
            panelClass: ['snackbar-success']
          });
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.loading = false;
          const errorMessage = error.error?.message || 'Failed to send reset link. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { 
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }
} 