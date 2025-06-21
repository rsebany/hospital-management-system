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
  // Define expected result structure based on component requirements
  analysis: {
    riskLevel: 'High' | 'Medium' | 'Low';
    urgentCare: boolean;
    emergencyCare: boolean;
    possibleConditions: Array<{
      condition: string;
      severity: 'Severe' | 'Moderate' | 'Mild';
      probability: number;
      symptoms: string[];
      recommendations: string[];
    }>;
    followUp: string;
    disclaimer: string;
    timestamp: string;
  };
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

export interface TextProcessingRequest {
  text: string;
  processingType?: 'summarize' | 'extract' | 'analyze';
}

export interface TextProcessingResult {
  summary: string;
  keyPoints: string[];
  extractedData?: any;
}

export interface AppointmentAssistanceRequest {
  symptoms: string;
  urgency: 'low' | 'medium' | 'high';
  preferredTime?: string;
  medicalHistory?: string[];
}

export interface AppointmentAssistanceResult {
  recommendedSpecialty: string;
  urgency: string;
  suggestedTimeframe: string;
  preparation: string[];
}

export interface ReportSummaryRequest {
  reportType: 'lab' | 'imaging' | 'consultation' | 'discharge';
  reportData: any;
}

export interface ReportSummaryResult {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  followUp: string[];
}

export interface MedicationInfoRequest {
  medicationName: string;
  includeInteractions?: boolean;
}

export interface MedicationInfoResult {
  name: string;
  genericName?: string;
  description: string;
  dosage: string;
  sideEffects: string[];
  interactions: string[];
  warnings: string[];
  category: string;
}

export interface WellnessRecommendationRequest {
  age: number;
  gender: string;
  activityLevel: string;
  healthGoals: string[];
  currentHealth: string[];
  lifestyle: string[];
}

export interface WellnessRecommendationResult {
  category: string;
  title: string;
  description: string;
  tips: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface EmergencyTriageRequest {
  symptoms: string[];
  description: string;
  age?: number;
  gender?: string;
  medicalHistory?: string;
}

export interface EmergencyTriageResult {
  urgency: 'immediate' | 'urgent' | 'moderate' | 'non-urgent';
  recommendation: string;
  actions: string[];
  warning: string;
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

  processText(data: TextProcessingRequest): Observable<TextProcessingResult> {
    return this.http.post<TextProcessingResult>(`${this.baseUrl}/text/process`, data);
  }

  getAppointmentAssistance(data: AppointmentAssistanceRequest): Observable<AppointmentAssistanceResult> {
    return this.http.post<AppointmentAssistanceResult>(`${this.baseUrl}/appointments/assist`, data);
  }

  generateReportSummary(data: ReportSummaryRequest): Observable<ReportSummaryResult> {
    return this.http.post<ReportSummaryResult>(`${this.baseUrl}/reports/summary`, data);
  }

  getMedicationInfo(data: MedicationInfoRequest): Observable<MedicationInfoResult> {
    return this.http.post<MedicationInfoResult>(`${this.baseUrl}/medications/info`, data);
  }

  getWellnessRecommendations(data: WellnessRecommendationRequest): Observable<WellnessRecommendationResult[]> {
    return this.http.post<WellnessRecommendationResult[]>(`${this.baseUrl}/wellness/recommendations`, data);
  }

  performEmergencyTriage(data: EmergencyTriageRequest): Observable<EmergencyTriageResult> {
    return this.http.post<EmergencyTriageResult>(`${this.baseUrl}/emergency/triage`, data);
  }

  checkHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }
} 