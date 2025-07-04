import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
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
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <mat-card style="max-width: 450px; width: 100%; border-radius: 16px; box-shadow: 0 20px 40px rgba(8, 145, 178, 0.2); background: #FFFFFF;">
        <div style="text-align: center; padding: 30px 20px 20px;">
          <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(8, 145, 178, 0.3);">
            <mat-icon style="color: white; font-size: 32px;">person_add</mat-icon>
          </div>
          <h2 style="color: #0891B2; font-size: 1.8rem; font-weight: 600; margin-bottom: 10px;">Create Account</h2>
          <p style="color: #64748B; margin-bottom: 30px;">Join our healthcare community</p>
        </div>

        <mat-card-content style="padding: 0 30px 30px;">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Role Selection -->
            <mat-form-field style="width: 100%; margin-bottom: 20px;">
              <mat-label style="color: #0891B2;">Register as</mat-label>
              <mat-select formControlName="role" [errorStateMatcher]="matcher">
                <mat-option value="patient">Patient</mat-option>
                <mat-option value="doctor">Doctor</mat-option>
                <mat-option value="nurse">Nurse</mat-option>
              </mat-select>
              <mat-icon matSuffix style="color: #0891B2;">work</mat-icon>
              <mat-error *ngIf="registerForm.get('role')?.hasError('required')">
                Please select a role
              </mat-error>
            </mat-form-field>

            <!-- Name Fields -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <mat-form-field>
                <mat-label style="color: #0891B2;">First Name</mat-label>
                <input 
                  matInput 
                  formControlName="firstName" 
                  placeholder="Enter first name"
                  [errorStateMatcher]="matcher"
                  style="color: #1E293B;"
                >
                <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label style="color: #0891B2;">Last Name</mat-label>
                <input 
                  matInput 
                  formControlName="lastName" 
                  placeholder="Enter last name"
                  [errorStateMatcher]="matcher"
                  style="color: #1E293B;"
                >
                <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Email Field -->
            <mat-form-field style="width: 100%; margin-bottom: 20px;">
              <mat-label style="color: #0891B2;">Email Address</mat-label>
              <input 
                matInput 
                type="email" 
                formControlName="email" 
                placeholder="Enter your email"
                [errorStateMatcher]="matcher"
                style="color: #1E293B;"
              >
              <mat-icon matSuffix style="color: #0891B2;">email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <!-- Password Fields -->
            <mat-form-field style="width: 100%; margin-bottom: 20px;">
              <mat-label style="color: #0891B2;">Password</mat-label>
              <input 
                matInput 
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password" 
                placeholder="Create a password"
                [errorStateMatcher]="matcher"
                style="color: #1E293B;"
              >
              <mat-icon matSuffix style="color: #0891B2; cursor: pointer;" (click)="togglePassword()">
                {{showPassword ? 'visibility_off' : 'visibility'}}
              </mat-icon>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field style="width: 100%; margin-bottom: 20px;">
              <mat-label style="color: #0891B2;">Confirm Password</mat-label>
              <input 
                matInput 
                [type]="showConfirmPassword ? 'text' : 'password'" 
                formControlName="confirmPassword" 
                placeholder="Confirm your password"
                [errorStateMatcher]="matcher"
                style="color: #1E293B;"
              >
              <mat-icon matSuffix style="color: #0891B2; cursor: pointer;" (click)="toggleConfirmPassword()">
                {{showConfirmPassword ? 'visibility_off' : 'visibility'}}
              </mat-icon>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <!-- Terms and Conditions -->
            <div style="margin-bottom: 25px;">
              <mat-checkbox formControlName="acceptTerms" style="color: #64748B;">
                I agree to the 
                <a href="#" style="color: #F97316; text-decoration: none;">Terms of Service</a> 
                and 
                <a href="#" style="color: #F97316; text-decoration: none;">Privacy Policy</a>
              </mat-checkbox>
              <div *ngIf="registerForm.get('acceptTerms')?.invalid && registerForm.get('acceptTerms')?.touched" 
                   style="color: #f44336; font-size: 0.8rem; margin-top: 5px;">
                You must accept the terms and conditions
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              mat-raised-button 
              style="width: 100%; height: 48px; background: #0891B2; color: white; font-size: 1.1rem; font-weight: 500; border-radius: 8px; border: none;"
              [disabled]="registerForm.invalid || loading"
            >
              <mat-spinner *ngIf="loading" style="width: 20px; height: 20px; margin-right: 10px;"></mat-spinner>
              {{loading ? 'Creating Account...' : 'Create Account'}}
            </button>

            <!-- Temporary Test Button -->
            <button 
              type="button" 
              mat-stroked-button 
              style="width: 100%; height: 40px; margin-top: 10px; border-color: #F97316; color: #F97316;"
              (click)="testRegistration()"
            >
              Test Registration (Debug)
            </button>
          </form>

          <!-- Divider -->
          <div style="display: flex; align-items: center; margin: 30px 0;">
            <div style="flex: 1; height: 1px; background-color: #F1F5F9;"></div>
            <span style="padding: 0 15px; color: #64748B; font-size: 0.9rem;">or</span>
            <div style="flex: 1; height: 1px; background-color: #F1F5F9;"></div>
          </div>

          <!-- Login Link -->
          <div style="text-align: center;">
            <span style="color: #64748B;">Already have an account? </span>
            <a 
              routerLink="/auth/login" 
              style="color: #F97316; text-decoration: none; font-weight: 500;"
            >
              Sign in here
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm!: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

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
    this.registerForm = this.fb.group({
      role: ['patient', [Validators.required]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
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
    console.log('Form valid:', this.registerForm.valid);
    console.log('Form errors:', this.registerForm.errors);
    console.log('Form values:', this.registerForm.value);
    
    // Log individual field errors
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control?.invalid) {
        console.log(`${key} errors:`, control.errors);
      }
    });

    if (this.registerForm.valid) {
      this.loading = true;
      const formData = {
        ...this.registerForm.value,
      };

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Registration successful! Please check your email to verify your account.', 'Close', { 
            duration: 5000,
            panelClass: ['snackbar-success']
          });
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.loading = false;
          const errorMessage = error.error?.message || 'Registration failed. Please try again.';
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
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  testRegistration(): void {
    console.log('Testing registration with hardcoded data...');
    
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'patient'
    };

    this.loading = true;
    this.authService.register(testData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Test registration successful:', response);
        this.snackBar.open('Test registration successful!', 'Close', { 
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Test registration failed:', error);
        const errorMessage = error.error?.message || 'Test registration failed. Please check console for details.';
        this.snackBar.open(errorMessage, 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}
