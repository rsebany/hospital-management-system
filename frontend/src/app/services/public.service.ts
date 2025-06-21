import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MockDataService } from './mock-data.service';

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  department?: string;
  specialization?: string;
  email?: string;
  phone?: string;
  experience?: number;
  education?: string;
  imageUrl?: string;
  availability?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headDoctor?: string;
  phone?: string;
  email?: string;
  location?: string;
  services?: string[];
}

export interface HospitalInfo {
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  established?: string;
  accreditation?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  visitingHours?: string;
  facilities?: string[];
  imageUrl?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export interface SearchFilters {
  department?: string;
  specialization?: string;
  limit?: number;
  page?: number;
}

export interface HospitalService {
  id: string;
  name: string;
  description?: string;
  department?: string;
  duration?: string;
  cost?: string;
  availability?: string;
  requirements?: string[];
}

export interface InsuranceProvider {
  id: string;
  name: string;
  logo?: string;
  phone?: string;
  website?: string;
  acceptedPlans?: string[];
  coverageDetails?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export interface EmergencyInfo {
  emergencyNumber: string;
  ambulanceNumber?: string;
  policeNumber?: string;
  fireNumber?: string;
  emergencyDepartments?: string[];
  emergencyInstructions?: string;
  nearestHospitals?: Array<{
    name: string;
    address: string;
    phone: string;
    distance?: string;
  }>;
}

export interface PatientRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
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
}

@Injectable({ providedIn: 'root' })
export class PublicService {
  private baseUrl = 'http://localhost:3000/api/v1/public';
  private useMockData = true; // Set to true to use mock data while backend is not ready

  constructor(
    private http: HttpClient,
    private mockData: MockDataService
  ) {}

  // Hospital Information
  getHospitalInfo(): Observable<HospitalInfo> {
    if (this.useMockData) {
      return of(this.mockData.getMockHospitalInfo());
    }
    return this.http.get<HospitalInfo>(`${this.baseUrl}/info`);
  }

  // Departments
  getDepartments(params?: { limit?: number; page?: number }): Observable<Department[]> {
    if (this.useMockData) {
      return of(this.mockData.getMockDepartments());
    }
    return this.http.get<Department[]>(`${this.baseUrl}/departments`, { params });
  }

  getDepartmentDetails(id: string): Observable<Department> {
    if (this.useMockData) {
      const depts = this.mockData.getMockDepartments();
      const dept = depts.find(d => d.id === id);
      return of(dept!);
    }
    return this.http.get<Department>(`${this.baseUrl}/departments/${id}`);
  }

  // Doctors
  getDoctors(filters?: SearchFilters): Observable<Doctor[]> {
    if (this.useMockData) {
      return of(this.mockData.getMockDoctors());
    }
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctors`, { params: filters as any });
  }

  getDoctorDetails(id: string): Observable<Doctor> {
    if (this.useMockData) {
      const doctors = this.mockData.getMockDoctors();
      const doctor = doctors.find(d => d.id === id);
      return of(doctor!);
    }
    return this.http.get<Doctor>(`${this.baseUrl}/doctors/${id}`);
  }

  // Contact Form
  sendContactForm(formData: ContactForm): Observable<any> {
    if (this.useMockData) {
      console.log('Mock contact form submission:', formData);
      return of({ success: true, message: 'Message sent successfully (mock)' });
    }
    return this.http.post(`${this.baseUrl}/contact`, formData);
  }

  // Hospital Services
  getServices(): Observable<HospitalService[]> {
    if (this.useMockData) {
      return of(this.mockData.getMockServices());
    }
    return this.http.get<HospitalService[]>(`${this.baseUrl}/services`);
  }

  // Insurance Providers
  getInsuranceProviders(): Observable<InsuranceProvider[]> {
    if (this.useMockData) {
      return of(this.mockData.getMockInsuranceProviders());
    }
    return this.http.get<InsuranceProvider[]>(`${this.baseUrl}/insurance`);
  }

  // FAQ
  getFAQ(): Observable<FAQ[]> {
    if (this.useMockData) {
      return of(this.mockData.getMockFAQ());
    }
    return this.http.get<FAQ[]>(`${this.baseUrl}/faq`);
  }

  // Emergency Information
  getEmergencyInfo(): Observable<EmergencyInfo> {
    if (this.useMockData) {
      return of(this.mockData.getMockEmergencyInfo());
    }
    return this.http.get<EmergencyInfo>(`${this.baseUrl}/emergency`);
  }

  // Patient Registration
  registerPatient(registrationData: PatientRegistration): Observable<any> {
    if (this.useMockData) {
      console.log('Mock patient registration:', registrationData);
      return of({ success: true, message: 'Patient registered successfully (mock)' });
    }
    return this.http.post(`${this.baseUrl}/register`, registrationData);
  }
} 