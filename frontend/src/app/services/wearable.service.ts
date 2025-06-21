import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

export interface VitalData {
  timestamp: string;
  heartRate: number;
  temperature: number;
  oxygenLevel: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  activityData?: {
    steps: number;
    sleepHours: number;
    calories: number;
  };
  deviceId: string;
  userId: string;
}

export interface VitalAnalysisResult {
  status: 'normal' | 'warning' | 'critical';
  alerts: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  nextCheckIn: string;
  emergencyContact?: boolean;
}

export interface WellnessRecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actions: string[];
}

export interface EmergencyAlert {
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  vitalData: VitalData;
  recommendedAction: string;
}

@Injectable({ providedIn: 'root' })
export class WearableService {
  private baseUrl = 'http://localhost:3000/api/v1';
  private vitalDataSubject = new BehaviorSubject<VitalData[]>([]);
  private alertsSubject = new BehaviorSubject<EmergencyAlert[]>([]);
  private isMonitoring = false;
  private monitoringInterval: any;

  public vitalData$ = this.vitalDataSubject.asObservable();
  public alerts$ = this.alertsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Start real-time monitoring
  startMonitoring(intervalMinutes: number = 5): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    const intervalMs = intervalMinutes * 60 * 1000;
    
    this.monitoringInterval = interval(intervalMs).pipe(
      switchMap(() => this.generateVitalData()),
      tap(data => this.sendVitalData(data)),
      catchError(error => {
        console.error('Monitoring error:', error);
        return [];
      })
    ).subscribe();
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      this.monitoringInterval.unsubscribe();
    }
  }

  // Generate realistic vital data
  private generateVitalData(): Observable<VitalData> {
    const now = new Date();
    const data: VitalData = {
      timestamp: now.toISOString(),
      heartRate: this.generateHeartRate(),
      temperature: this.generateTemperature(),
      oxygenLevel: this.generateOxygenLevel(),
      bloodPressure: this.generateBloodPressure(),
      activityData: this.generateActivityData(),
      deviceId: 'smart-watch-001',
      userId: 'user-123'
    };

    return new Observable(observer => {
      observer.next(data);
      observer.complete();
    });
  }

  private generateHeartRate(): number {
    // Normal range: 60-100 bpm, with some variation
    const baseRate = 70 + Math.random() * 30;
    return Math.round(baseRate);
  }

  private generateTemperature(): number {
    // Normal range: 36.5-37.5°C, with fever possibility
    const baseTemp = 36.8 + (Math.random() - 0.5) * 2;
    return Math.round(baseTemp * 10) / 10;
  }

  private generateOxygenLevel(): number {
    // Normal range: 95-100%, with some variation
    const baseLevel = 97 + (Math.random() - 0.5) * 4;
    return Math.round(baseLevel);
  }

  private generateBloodPressure(): { systolic: number; diastolic: number } {
    const systolic = 110 + Math.random() * 30;
    const diastolic = 70 + Math.random() * 20;
    return {
      systolic: Math.round(systolic),
      diastolic: Math.round(diastolic)
    };
  }

  private generateActivityData(): { steps: number; sleepHours: number; calories: number } {
    return {
      steps: Math.floor(Math.random() * 10000),
      sleepHours: 6 + Math.random() * 4,
      calories: Math.floor(Math.random() * 2000)
    };
  }

  // Send vital data to backend for analysis
  sendVitalData(data: VitalData): Observable<VitalAnalysisResult> {
    const payload = {
      records: [data],
      analysisType: 'general'
    };

    return this.http.post<VitalAnalysisResult>(`${this.baseUrl}/ai/records/analyze`, payload).pipe(
      tap(result => {
        // Update local data
        const currentData = this.vitalDataSubject.value;
        this.vitalDataSubject.next([...currentData, data]);

        // Check for alerts
        this.checkForAlerts(data, result);
      }),
      catchError(error => {
        console.error('Error sending vital data:', error);
        throw error;
      })
    );
  }

  // Get wellness recommendations based on vital data
  getWellnessRecommendations(data: VitalData[]): Observable<WellnessRecommendation[]> {
    const payload = {
      age: 30, // This should come from user profile
      gender: 'male',
      activityLevel: 'moderately_active',
      healthGoals: ['maintain_health', 'improve_fitness'],
      currentHealth: [],
      lifestyle: ['sedentary_job'],
      records: data
    };

    return this.http.post<WellnessRecommendation[]>(`${this.baseUrl}/ai/wellness/recommendations/vitals`, payload);
  }

  // Check for critical alerts
  private checkForAlerts(data: VitalData, analysis: VitalAnalysisResult): void {
    const alerts: EmergencyAlert[] = [];

    // Heart rate alerts
    if (data.heartRate > 120) {
      alerts.push({
        type: 'warning',
        message: `Elevated heart rate detected: ${data.heartRate} bpm`,
        timestamp: data.timestamp,
        vitalData: data,
        recommendedAction: 'Consider rest and relaxation. If persistent, contact healthcare provider.'
      });
    }

    if (data.heartRate > 140) {
      alerts.push({
        type: 'critical',
        message: `Critical heart rate: ${data.heartRate} bpm`,
        timestamp: data.timestamp,
        vitalData: data,
        recommendedAction: 'Seek immediate medical attention.'
      });
    }

    // Temperature alerts
    if (data.temperature > 38.0) {
      alerts.push({
        type: 'warning',
        message: `Fever detected: ${data.temperature}°C`,
        timestamp: data.timestamp,
        vitalData: data,
        recommendedAction: 'Monitor temperature. Consider fever-reducing medication if needed.'
      });
    }

    if (data.temperature > 39.0) {
      alerts.push({
        type: 'critical',
        message: `High fever: ${data.temperature}°C`,
        timestamp: data.timestamp,
        vitalData: data,
        recommendedAction: 'Seek immediate medical attention.'
      });
    }

    // Oxygen level alerts
    if (data.oxygenLevel < 95) {
      alerts.push({
        type: 'warning',
        message: `Low oxygen level: ${data.oxygenLevel}%`,
        timestamp: data.timestamp,
        vitalData: data,
        recommendedAction: 'Monitor breathing. Consider deep breathing exercises.'
      });
    }

    if (data.oxygenLevel < 90) {
      alerts.push({
        type: 'critical',
        message: `Critical oxygen level: ${data.oxygenLevel}%`,
        timestamp: data.timestamp,
        vitalData: data,
        recommendedAction: 'Seek immediate medical attention.'
      });
    }

    // Blood pressure alerts
    if (data.bloodPressure) {
      if (data.bloodPressure.systolic > 140 || data.bloodPressure.diastolic > 90) {
        alerts.push({
          type: 'warning',
          message: `Elevated blood pressure: ${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}`,
          timestamp: data.timestamp,
          vitalData: data,
          recommendedAction: 'Monitor blood pressure. Consider lifestyle changes.'
        });
      }

      if (data.bloodPressure.systolic > 180 || data.bloodPressure.diastolic > 110) {
        alerts.push({
          type: 'critical',
          message: `Critical blood pressure: ${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}`,
          timestamp: data.timestamp,
          vitalData: data,
          recommendedAction: 'Seek immediate medical attention.'
        });
      }
    }

    // Add alerts to the stream
    if (alerts.length > 0) {
      const currentAlerts = this.alertsSubject.value;
      this.alertsSubject.next([...currentAlerts, ...alerts]);

      // Send critical alerts to backend
      alerts.filter(alert => alert.type === 'critical').forEach(alert => {
        this.sendEmergencyAlert(alert);
      });
    }
  }

  // Send emergency alert to backend
  private sendEmergencyAlert(alert: EmergencyAlert): void {
    const payload = {
      type: alert.type,
      message: alert.message,
      vitalData: alert.vitalData,
      timestamp: alert.timestamp,
      recommendedAction: alert.recommendedAction
    };

    this.http.post(`${this.baseUrl}/patients/notifications`, payload).subscribe({
      next: () => console.log('Emergency alert sent successfully'),
      error: (error) => console.error('Error sending emergency alert:', error)
    });
  }

  // Get historical vital data
  getHistoricalData(days: number = 7): Observable<VitalData[]> {
    return this.http.get<VitalData[]>(`${this.baseUrl}/wearables/history?days=${days}`);
  }

  // Get current alerts
  getCurrentAlerts(): EmergencyAlert[] {
    return this.alertsSubject.value;
  }

  // Clear alerts
  clearAlerts(): void {
    this.alertsSubject.next([]);
  }

  // Get monitoring status
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
} 