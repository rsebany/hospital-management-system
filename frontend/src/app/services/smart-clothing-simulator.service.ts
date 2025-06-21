import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, timer } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

export interface SmartClothingData {
  timestamp: string;
  temperature: number; // Température corporelle
  heartRate: number; // Fréquence cardiaque
  oxygenLevel: number; // Taux d'oxygène
  deviceId: string;
  userId: string;
  batteryLevel: number;
  signalStrength: number;
}

export interface SmartClothingAlert {
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  vitalData: SmartClothingData;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
}

@Injectable({ providedIn: 'root' })
export class SmartClothingSimulatorService {
  private baseUrl = 'http://localhost:3000/api/v1';
  private vitalDataSubject = new BehaviorSubject<SmartClothingData[]>([]);
  private alertsSubject = new BehaviorSubject<SmartClothingAlert[]>([]);
  private isSimulating = false;
  private simulationInterval: any;
  private alertInterval: any;

  public vitalData$ = this.vitalDataSubject.asObservable();
  public alerts$ = this.alertsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Start smart clothing simulation
  startSimulation(intervalSeconds: number = 30): void {
    if (this.isSimulating) return;
    
    this.isSimulating = true;
    console.log('🩺 Smart Clothing Simulation Started');
    
    // Send initial data immediately
    this.sendVitalData();
    
    // Set up regular data transmission
    this.simulationInterval = interval(intervalSeconds * 1000).pipe(
      tap(() => this.sendVitalData()),
      catchError(error => {
        console.error('Smart clothing simulation error:', error);
        return [];
      })
    ).subscribe();

    // Set up alert monitoring
    this.alertInterval = interval(10 * 1000).pipe(
      tap(() => this.checkForAlerts()),
      catchError(error => {
        console.error('Alert monitoring error:', error);
        return [];
      })
    ).subscribe();
  }

  // Stop simulation
  stopSimulation(): void {
    this.isSimulating = false;
    if (this.simulationInterval) {
      this.simulationInterval.unsubscribe();
    }
    if (this.alertInterval) {
      this.alertInterval.unsubscribe();
    }
    console.log('🩺 Smart Clothing Simulation Stopped');
  }

  // Generate realistic vital data
  private generateVitalData(): SmartClothingData {
    const now = new Date();
    
    // Generate realistic vital signs with some variation
    const baseTemperature = 36.8 + (Math.random() - 0.5) * 2; // 35.8 - 37.8°C
    const baseHeartRate = 70 + Math.random() * 30; // 70-100 bpm
    const baseOxygenLevel = 97 + (Math.random() - 0.5) * 4; // 95-99%

    // Occasionally generate abnormal values for testing alerts
    const shouldGenerateAlert = Math.random() < 0.1; // 10% chance
    
    const data: SmartClothingData = {
      timestamp: now.toISOString(),
      temperature: shouldGenerateAlert && Math.random() < 0.5 
        ? 38.5 + Math.random() * 2 // Fever simulation
        : Math.round(baseTemperature * 10) / 10,
      heartRate: shouldGenerateAlert && Math.random() < 0.5
        ? 120 + Math.random() * 40 // Tachycardia simulation
        : Math.round(baseHeartRate),
      oxygenLevel: shouldGenerateAlert && Math.random() < 0.5
        ? 90 + Math.random() * 5 // Low oxygen simulation
        : Math.round(baseOxygenLevel),
      deviceId: 'smart-shirt-001',
      userId: 'patient-123',
      batteryLevel: 85 + Math.random() * 15, // 85-100%
      signalStrength: 80 + Math.random() * 20 // 80-100%
    };

    return data;
  }

  // Send vital data to backend
  private sendVitalData(): void {
    const data = this.generateVitalData();
    
    console.log('📡 Smart Clothing Data Sent:', {
      temperature: data.temperature + '°C',
      heartRate: data.heartRate + ' bpm',
      oxygenLevel: data.oxygenLevel + '%',
      timestamp: new Date(data.timestamp).toLocaleTimeString()
    });

    // Send to backend for analysis
    const payload = {
      records: [data],
      analysisType: 'smart_clothing'
    };

    this.http.post(`${this.baseUrl}/ai/records/analyze`, payload).subscribe({
      next: (result) => {
        console.log('✅ Vital data analyzed:', result);
        
        // Update local data
        const currentData = this.vitalDataSubject.value;
        this.vitalDataSubject.next([...currentData, data]);
      },
      error: (error) => {
        console.error('❌ Error sending vital data:', error);
        
        // Still update local data even if backend fails
        const currentData = this.vitalDataSubject.value;
        this.vitalDataSubject.next([...currentData, data]);
      }
    });
  }

  // Check for alerts based on vital data
  private checkForAlerts(): void {
    const currentData = this.vitalDataSubject.value;
    if (currentData.length === 0) return;

    const latestData = currentData[currentData.length - 1];
    const alerts: SmartClothingAlert[] = [];

    // Temperature alerts (Température corporelle)
    if (latestData.temperature > 38.0) {
      alerts.push({
        type: latestData.temperature > 39.0 ? 'critical' : 'warning',
        message: `Fièvre détectée: ${latestData.temperature}°C`,
        timestamp: latestData.timestamp,
        vitalData: latestData,
        severity: latestData.temperature > 39.0 ? 'critical' : 'high',
        actionRequired: true
      });
    }

    if (latestData.temperature < 36.0) {
      alerts.push({
        type: 'warning',
        message: `Hypothermie détectée: ${latestData.temperature}°C`,
        timestamp: latestData.timestamp,
        vitalData: latestData,
        severity: 'high',
        actionRequired: true
      });
    }

    // Heart rate alerts (Fréquence cardiaque)
    if (latestData.heartRate > 120) {
      alerts.push({
        type: latestData.heartRate > 140 ? 'critical' : 'warning',
        message: `Tachycardie détectée: ${latestData.heartRate} bpm`,
        timestamp: latestData.timestamp,
        vitalData: latestData,
        severity: latestData.heartRate > 140 ? 'critical' : 'high',
        actionRequired: true
      });
    }

    if (latestData.heartRate < 60) {
      alerts.push({
        type: 'warning',
        message: `Bradycardie détectée: ${latestData.heartRate} bpm`,
        timestamp: latestData.timestamp,
        vitalData: latestData,
        severity: 'high',
        actionRequired: true
      });
    }

    // Oxygen level alerts (Taux d'oxygène)
    if (latestData.oxygenLevel < 95) {
      alerts.push({
        type: latestData.oxygenLevel < 90 ? 'critical' : 'warning',
        message: `Faible taux d'oxygène: ${latestData.oxygenLevel}%`,
        timestamp: latestData.timestamp,
        vitalData: latestData,
        severity: latestData.oxygenLevel < 90 ? 'critical' : 'high',
        actionRequired: true
      });
    }

    // Battery level alerts
    if (latestData.batteryLevel < 20) {
      alerts.push({
        type: 'warning',
        message: `Batterie faible: ${Math.round(latestData.batteryLevel)}%`,
        timestamp: latestData.timestamp,
        vitalData: latestData,
        severity: 'medium',
        actionRequired: false
      });
    }

    // Signal strength alerts
    if (latestData.signalStrength < 50) {
      alerts.push({
        type: 'warning',
        message: `Signal faible: ${Math.round(latestData.signalStrength)}%`,
        timestamp: latestData.timestamp,
        vitalData: latestData,
        severity: 'medium',
        actionRequired: false
      });
    }

    // Add alerts to the stream
    if (alerts.length > 0) {
      const currentAlerts = this.alertsSubject.value;
      this.alertsSubject.next([...currentAlerts, ...alerts]);

      // Send critical alerts to dashboard
      alerts.filter(alert => alert.severity === 'critical').forEach(alert => {
        this.sendCriticalAlert(alert);
      });

      console.log('🚨 Smart Clothing Alerts Generated:', alerts.length);
    }
  }

  // Send critical alert to dashboard
  private sendCriticalAlert(alert: SmartClothingAlert): void {
    const payload = {
      type: 'smart_clothing_critical',
      message: alert.message,
      vitalData: alert.vitalData,
      timestamp: alert.timestamp,
      severity: alert.severity,
      actionRequired: alert.actionRequired
    };

    this.http.post(`${this.baseUrl}/patients/notifications`, payload).subscribe({
      next: () => console.log('🚨 Critical alert sent to dashboard'),
      error: (error) => console.error('❌ Error sending critical alert:', error)
    });
  }

  // Get current vital data
  getCurrentVitalData(): SmartClothingData | null {
    const data = this.vitalDataSubject.value;
    return data.length > 0 ? data[data.length - 1] : null;
  }

  // Get all alerts
  getCurrentAlerts(): SmartClothingAlert[] {
    return this.alertsSubject.value;
  }

  // Clear alerts
  clearAlerts(): void {
    this.alertsSubject.next([]);
  }

  // Get simulation status
  isSimulatingActive(): boolean {
    return this.isSimulating;
  }

  // Get historical data
  getHistoricalData(hours: number = 24): SmartClothingData[] {
    const data = this.vitalDataSubject.value;
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return data.filter(item => new Date(item.timestamp) > cutoffTime);
  }

  // Simulate emergency situation
  simulateEmergency(): void {
    const emergencyData: SmartClothingData = {
      timestamp: new Date().toISOString(),
      temperature: 39.5,
      heartRate: 150,
      oxygenLevel: 88,
      deviceId: 'smart-shirt-001',
      userId: 'patient-123',
      batteryLevel: 90,
      signalStrength: 95
    };

    this.vitalDataSubject.next([...this.vitalDataSubject.value, emergencyData]);
    console.log('🚨 Emergency situation simulated');
  }
} 