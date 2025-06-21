import { Routes } from '@angular/router';
import { PublicInfoComponent } from './components/public-info.component';
import { HospitalServicesComponent } from './components/hospital-services.component';
import { InsuranceProvidersComponent } from './components/insurance-providers.component';
import { FAQComponent } from './components/faq.component';
import { EmergencyInfoComponent } from './components/emergency-info.component';
import { PatientRegistrationComponent } from './components/patient-registration.component';
import { DepartmentDetailsComponent } from './components/department-details.component';
import { DoctorDetailsComponent } from './components/doctor-details.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password.component';
import { VerifyEmailComponent } from './components/auth/verify-email.component';
import { ProfileComponent } from './components/auth/profile.component';
import { TwoFactorAuthComponent } from './components/auth/two-factor-auth.component';

// AI Components
import { AiDashboardComponent } from './components/ai/ai-dashboard.component';
import { SymptomAnalyzerComponent } from './components/ai/symptom-analyzer.component';
import { MedicalRecordsAnalyzerComponent } from './components/ai/medical-records-analyzer.component';
import { AiChatComponent } from './components/ai/ai-chat.component';
import { MedicationInfoComponent } from './components/ai/medication-info.component';
import { WellnessRecommendationsComponent } from './components/ai/wellness-recommendations.component';
import { EmergencyTriageComponent } from './components/ai/emergency-triage.component';
import { TextProcessorComponent } from './components/ai/text-processor.component';
import { ReportsGeneratorComponent } from './components/ai/reports-generator.component';
import { SmartClothingTestComponent } from './components/ai/smart-clothing-test.component';

export const routes: Routes = [
  { path: 'public-info', component: PublicInfoComponent },
  { path: 'services', component: HospitalServicesComponent },
  { path: 'insurance', component: InsuranceProvidersComponent },
  { path: 'faq', component: FAQComponent },
  { path: 'emergency', component: EmergencyInfoComponent },
  { path: 'register', component: PatientRegistrationComponent },
  { path: 'departments', component: HospitalServicesComponent },
  { path: 'departments/:id', component: DepartmentDetailsComponent },
  { path: 'doctors', component: HospitalServicesComponent },
  { path: 'doctors/:id', component: DoctorDetailsComponent },
  
  // Authentication routes
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'auth/verify-email', component: VerifyEmailComponent },
  { path: 'auth/profile', component: ProfileComponent },
  { path: 'auth/2fa', component: TwoFactorAuthComponent },
  
  // AI Routes
  { path: 'ai', component: AiDashboardComponent },
  { path: 'ai/dashboard', component: AiDashboardComponent },
  { path: 'ai/symptoms', component: SymptomAnalyzerComponent },
  { path: 'ai/records', component: MedicalRecordsAnalyzerComponent },
  { path: 'ai/chat', component: AiChatComponent },
  { path: 'ai/medications', component: MedicationInfoComponent },
  { path: 'ai/wellness', component: WellnessRecommendationsComponent },
  { path: 'ai/emergency', component: EmergencyTriageComponent },
  { path: 'ai/text-processor', component: TextProcessorComponent },
  { path: 'ai/reports', component: ReportsGeneratorComponent },
  { path: 'ai/smart-clothing-test', component: SmartClothingTestComponent },
  
  { path: '', redirectTo: '/public-info', pathMatch: 'full' }
];
