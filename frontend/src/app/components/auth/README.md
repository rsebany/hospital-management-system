# Authentication Components

This folder contains all the authentication-related components for the Hopitaliko application.

## Components Overview

### 1. LoginComponent (`login.component.ts`)
- **Purpose**: User login with email and password
- **Features**: 
  - Form validation
  - Password visibility toggle
  - Remember me functionality
  - Error handling
  - Role-based navigation after login
- **Route**: `/auth/login`

### 2. RegisterComponent (`register.component.ts`)
- **Purpose**: User registration with role-based signup
- **Features**:
  - Role selection (Patient, Doctor, Nurse)
  - Form validation with password confirmation
  - Terms and conditions acceptance
  - Email verification flow
- **Route**: `/auth/register`

### 3. ForgotPasswordComponent (`forgot-password.component.ts`)
- **Purpose**: Password reset request
- **Features**:
  - Email validation
  - Reset link sending
  - User-friendly messaging
- **Route**: `/auth/forgot-password`

### 4. ResetPasswordComponent (`reset-password.component.ts`)
- **Purpose**: Password reset with token validation
- **Features**:
  - Token extraction from URL
  - New password with confirmation
  - Password strength validation
- **Route**: `/auth/reset-password?token=<token>`

### 5. VerifyEmailComponent (`verify-email.component.ts`)
- **Purpose**: Email verification
- **Features**:
  - Token validation
  - Success/error states
  - Resend verification option
- **Route**: `/auth/verify-email?token=<token>`

### 6. ProfileComponent (`profile.component.ts`)
- **Purpose**: User profile management
- **Features**:
  - Personal information editing
  - Address management
  - Password change
  - 2FA setup
  - Profile display
- **Route**: `/auth/profile`

### 7. TwoFactorAuthComponent (`two-factor-auth.component.ts`)
- **Purpose**: Two-factor authentication setup
- **Features**:
  - QR code generation
  - Manual entry option
  - Code verification
  - Step-by-step setup process
- **Route**: `/auth/2fa`

## API Endpoints Used

All components use the following authentication endpoints:

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset
- `POST /api/v1/auth/verify-email` - Email verification
- `GET /api/v1/auth/me` - Get user profile
- `PUT /api/v1/auth/me` - Update user profile
- `PUT /api/v1/auth/me/address` - Update user address
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/enable-2fa` - Enable 2FA
- `POST /api/v1/auth/disable-2fa` - Disable 2FA
- `GET /api/v1/auth/setup-2fa` - Setup 2FA
- `POST /api/v1/auth/verify-2fa` - Verify 2FA code
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token

## Features

### Security Features
- JWT token management
- Refresh token handling
- Password strength validation
- Two-factor authentication
- Email verification
- Secure password reset flow

### UI/UX Features
- Modern, responsive design
- Material Design components
- Loading states
- Error handling with user-friendly messages
- Form validation
- Progressive disclosure (stepper for 2FA)

### Form Validation
- Required field validation
- Email format validation
- Password strength requirements
- Password confirmation matching
- Custom error state matchers

## Usage

### Importing Components
```typescript
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
// ... other components
```

### Routing Setup
```typescript
const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'auth/verify-email', component: VerifyEmailComponent },
  { path: 'auth/profile', component: ProfileComponent },
  { path: 'auth/2fa', component: TwoFactorAuthComponent },
];
```

### Dependencies
- Angular Material
- Angular Reactive Forms
- Angular Router
- RxJS

## Styling

All components use:
- CSS Grid and Flexbox for layout
- Material Design color palette
- Consistent spacing and typography
- Responsive design principles
- Gradient backgrounds for visual appeal

## Error Handling

Components include comprehensive error handling:
- Network errors
- Validation errors
- Authentication errors
- User-friendly error messages
- Snackbar notifications

## Accessibility

Components are built with accessibility in mind:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast support 