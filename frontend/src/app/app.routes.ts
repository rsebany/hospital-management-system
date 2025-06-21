import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { PublicInfoComponent } from './components/public-info.component';
import { HospitalServicesComponent } from './components/hospital-services.component';
import { InsuranceProvidersComponent } from './components/insurance-providers.component';
import { FAQComponent } from './components/faq.component';
import { EmergencyInfoComponent } from './components/emergency-info.component';
import { AiSymptomComponent } from './components/ai-symptom.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { WearableDataComponent } from './components/wearable-data.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'public-info', component: PublicInfoComponent },
  { path: 'services', component: HospitalServicesComponent },
  { path: 'insurance', component: InsuranceProvidersComponent },
  { path: 'faq', component: FAQComponent },
  { path: 'emergency', component: EmergencyInfoComponent },
  { path: 'ai-symptom', component: AiSymptomComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'wearable-data', component: WearableDataComponent },
  { path: 'departments', component: HospitalServicesComponent },
  { path: 'departments/:id', component: HospitalServicesComponent },
  { path: 'doctors', component: HospitalServicesComponent },
  { path: 'appointment', component: HospitalServicesComponent },
  { path: '', redirectTo: '/public-info', pathMatch: 'full' }
];
