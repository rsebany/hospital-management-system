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
  selector: 'app-login',
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
            <mat-icon style="color: white; font-size: 32px;">medical_services</mat-icon>
          </div>
          <h2 style="color: #0891B2; font-size: 1.8rem; font-weight: 600; margin-bottom: 10px;">Welcome Back</h2>
          <p style="color: #64748B; margin-bottom: 30px;">Sign in to access your AI healthcare portal</p>
        </div>

        <mat-card-content style="padding: 0 30px 30px;">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <!-- Password Field -->
            <mat-form-field style="width: 100%; margin-bottom: 20px;">
              <mat-label style="color: #0891B2;">Password</mat-label>
              <input 
                matInput 
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password" 
                placeholder="Enter your password"
                [errorStateMatcher]="matcher"
                style="color: #1E293B;"
              >
              <mat-icon matSuffix style="color: #0891B2; cursor: pointer;" (click)="togglePassword()">
                {{showPassword ? 'visibility_off' : 'visibility'}}
              </mat-icon>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <!-- Forgot Password -->
            <div style="text-align: right; margin-bottom: 25px;">
              <a 
                routerLink="/auth/forgot-password" 
                style="color: #F97316; text-decoration: none; font-size: 0.9rem; font-weight: 500;"
              >
                Forgot Password?
              </a>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              mat-raised-button 
              style="width: 100%; height: 48px; background: #0891B2; color: white; font-size: 1.1rem; font-weight: 500; border-radius: 8px; border: none;"
              [disabled]="loginForm.invalid || loading"
            >
              <mat-spinner *ngIf="loading" style="width: 20px; height: 20px; margin-right: 10px;"></mat-spinner>
              {{loading ? 'Signing In...' : 'Sign In'}}
            </button>

            <!-- Test Login Button -->
            <button 
              type="button" 
              mat-stroked-button 
              style="width: 100%; height: 40px; margin-top: 10px; border-color: #F97316; color: #F97316;"
              (click)="testLogin()"
              [disabled]="loading"
            >
              Test Login (Debug)
            </button>
          </form>

          <!-- Divider -->
          <div style="display: flex; align-items: center; margin: 30px 0;">
            <div style="flex: 1; height: 1px; background-color: #F1F5F9;"></div>
            <span style="padding: 0 15px; color: #64748B; font-size: 0.9rem;">or</span>
            <div style="flex: 1; height: 1px; background-color: #F1F5F9;"></div>
          </div>

          <!-- Register Link -->
          <div style="text-align: center;">
            <span style="color: #64748B;">Don't have an account? </span>
            <a 
              routerLink="/auth/register" 
              style="color: #F97316; text-decoration: none; font-weight: 500;"
            >
              Sign up here
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm!: FormGroup;
  loading = false;
  showPassword = false;

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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      console.log('Attempting login with:', credentials);

      // For testing purposes, allow a test login
      if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
        console.log('Test login detected, bypassing backend...');
        this.loading = false;
        
        // Simulate successful login
        const mockResponse = {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            email: credentials.email,
            role: 'patient',
            firstName: 'Test',
            lastName: 'User'
          }
        };
        
        // Store mock token
        this.authService.setToken(mockResponse.token);
        
        this.snackBar.open('Test login successful! Welcome to AI Healthcare Portal', 'Close', { 
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        
        console.log('Redirecting to AI dashboard...');
        this.router.navigate(['/ai']).then(() => {
          console.log('Navigation completed');
        }).catch((error) => {
          console.error('Navigation error:', error);
        });
        return;
      }

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.loading = false;
          this.snackBar.open('Login successful! Welcome to AI Healthcare Portal', 'Close', { 
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          
          // Redirect to AI dashboard after successful login
          console.log('Redirecting to AI dashboard...');
          this.router.navigate(['/ai']).then(() => {
            console.log('Navigation completed');
          }).catch((error) => {
            console.error('Navigation error:', error);
          });
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loading = false;
          const errorMessage = error.error?.message || 'Login failed. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { 
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      console.log('Form is invalid:', this.loginForm.errors);
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  testLogin(): void {
    console.log('Test login button clicked');
    this.loading = true;
    
    // Simulate successful login
    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'patient',
        firstName: 'Test',
        lastName: 'User'
      }
    };
    
    // Store mock token
    this.authService.setToken(mockResponse.token);
    
    setTimeout(() => {
      this.loading = false;
      this.snackBar.open('Test login successful! Welcome to AI Healthcare Portal', 'Close', { 
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      
      console.log('Redirecting to AI dashboard...');
      this.router.navigate(['/ai']).then(() => {
        console.log('Navigation completed');
      }).catch((error) => {
        console.error('Navigation error:', error);
      });
    }, 1000);
  }
} 