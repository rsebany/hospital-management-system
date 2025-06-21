import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
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
            <mat-icon style="color: white; font-size: 32px;">lock_open</mat-icon>
          </div>
          <h2 style="color: #0891B2; font-size: 1.8rem; font-weight: 600; margin-bottom: 10px;">Reset Password</h2>
          <p style="color: #64748B; margin-bottom: 30px;">Enter your new password</p>
        </div>

        <mat-card-content style="padding: 0 30px 30px;">
          <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
            <!-- New Password Field -->
            <mat-form-field style="width: 100%; margin-bottom: 20px;">
              <mat-label style="color: #0891B2;">New Password</mat-label>
              <input 
                matInput 
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password" 
                placeholder="Enter new password"
                [errorStateMatcher]="matcher"
                style="color: #1E293B;"
              >
              <mat-icon matSuffix style="color: #0891B2; cursor: pointer;" (click)="togglePassword()">
                {{showPassword ? 'visibility_off' : 'visibility'}}
              </mat-icon>
              <mat-error *ngIf="resetPasswordForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="resetPasswordForm.get('password')?.hasError('minlength')">
                Password must be at least 8 characters
              </mat-error>
              <mat-error *ngIf="resetPasswordForm.get('password')?.hasError('pattern')">
                Password must contain at least one uppercase letter, one lowercase letter, and one number
              </mat-error>
            </mat-form-field>

            <!-- Confirm Password Field -->
            <mat-form-field style="width: 100%; margin-bottom: 25px;">
              <mat-label style="color: #0891B2;">Confirm New Password</mat-label>
              <input 
                matInput 
                [type]="showConfirmPassword ? 'text' : 'password'" 
                formControlName="confirmPassword" 
                placeholder="Confirm new password"
                [errorStateMatcher]="matcher"
                style="color: #1E293B;"
              >
              <mat-icon matSuffix style="color: #0891B2; cursor: pointer;" (click)="toggleConfirmPassword()">
                {{showConfirmPassword ? 'visibility_off' : 'visibility'}}
              </mat-icon>
              <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.hasError('required')">
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <!-- Submit Button -->
            <button 
              type="submit" 
              mat-raised-button 
              style="width: 100%; height: 48px; background: #0891B2; color: white; font-size: 1.1rem; font-weight: 500; border-radius: 8px; border: none;"
              [disabled]="resetPasswordForm.invalid || loading"
            >
              <mat-spinner *ngIf="loading" style="width: 20px; height: 20px; margin-right: 10px;"></mat-spinner>
              {{loading ? 'Resetting...' : 'Reset Password'}}
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
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  resetPasswordForm!: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  token: string = '';

  // Custom error state matcher
  matcher = {
    isErrorState: (control: any) => {
      return control && control.invalid && (control.dirty || control.touched);
    }
  };

  ngOnInit(): void {
    this.initForm();
    this.getTokenFromRoute();
  }

  initForm(): void {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  getTokenFromRoute(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.snackBar.open('Invalid reset link. Please request a new one.', 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-error']
        });
        this.router.navigate(['/auth/forgot-password']);
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token) {
      this.loading = true;
      const resetData = {
        token: this.token,
        password: this.resetPasswordForm.value.password
      };

      this.authService.resetPassword(resetData).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.snackBar.open('Password reset successful! You can now login with your new password.', 'Close', { 
            duration: 5000,
            panelClass: ['snackbar-success']
          });
          this.router.navigate(['/auth/login']);
        },
        error: (error: any) => {
          this.loading = false;
          const errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
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
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      const control = this.resetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }
} 