import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SymptomAnalysisRequest {
  symptoms: string;
  patientAge: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string[];
}

export interface SymptomAnalysisResult {
  // Define expected result structure
  diagnosis: string;
  recommendations: string[];
}

export interface MedicalRecordsAnalysisRequest {
  records: any[];
  analysisType?: 'general' | 'medication' | 'lab_results' | 'appointments';
}

export interface MedicalRecordsAnalysisResult {
  // Define expected result structure
  summary: string;
  findings: string[];
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private baseUrl = 'http://localhost:3000/api/v1/ai';

  constructor(private http: HttpClient) {}

  analyzeSymptoms(data: SymptomAnalysisRequest): Observable<SymptomAnalysisResult> {
    return this.http.post<SymptomAnalysisResult>(`${this.baseUrl}/symptoms/analyze`, data);
  }

  analyzeMedicalRecords(data: MedicalRecordsAnalysisRequest): Observable<MedicalRecordsAnalysisResult> {
    return this.http.post<MedicalRecordsAnalysisResult>(`${this.baseUrl}/records/analyze`, data);
  }
} 