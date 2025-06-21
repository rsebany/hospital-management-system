import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { WearableService, VitalData } from '../../services/wearable.service';
import { SmartClothingSimulatorService, SmartClothingData, SmartClothingAlert } from '../../services/smart-clothing-simulator.service';

@Component({
  selector: 'app-ai-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div class="container mx-auto px-4 max-w-7xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🤖 AI-Powered Medical Intelligence Hub
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Revolutionary healthcare AI system with real-time vital monitoring, predictive analytics, and intelligent medical assistance
          </p>
        </div>

        <!-- Smart Clothing Simulator Status -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">👕 Smart Clothing Simulator</h2>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" [ngClass]="isSmartClothingActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"></div>
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ isSmartClothingActive ? 'Simulation Active' : 'Simulation Inactive' }}
                </span>
              </div>
              <button 
                (click)="toggleSmartClothingSimulation()"
                [class]="isSmartClothingActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
                class="text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                {{ isSmartClothingActive ? 'Stop Simulation' : 'Start Simulation' }}
              </button>
              <button 
                (click)="simulateEmergency()"
                class="bg-red-800 hover:bg-red-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                🚨 Emergency Test
              </button>
            </div>
          </div>

          <!-- Current Smart Clothing Data -->
          <div *ngIf="latestSmartClothingData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-red-600 dark:text-red-400 font-medium">Température</p>
                  <p class="text-2xl font-bold text-red-700 dark:text-red-300">{{ latestSmartClothingData.temperature }}°C</p>
                </div>
                <span class="text-2xl">🌡️</span>
              </div>
              <p class="text-xs text-red-600 dark:text-red-400 mt-1">
                {{ getTemperatureStatus(latestSmartClothingData.temperature) }}
              </p>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">Fréquence Cardiaque</p>
                  <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ latestSmartClothingData.heartRate }} bpm</p>
                </div>
                <span class="text-2xl">❤️</span>
              </div>
              <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {{ getHeartRateStatus(latestSmartClothingData.heartRate) }}
              </p>
            </div>

            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-green-600 dark:text-green-400 font-medium">Taux d'Oxygène</p>
                  <p class="text-2xl font-bold text-green-700 dark:text-green-300">{{ latestSmartClothingData.oxygenLevel }}%</p>
                </div>
                <span class="text-2xl">🫁</span>
              </div>
              <p class="text-xs text-green-600 dark:text-green-400 mt-1">
                {{ getOxygenStatus(latestSmartClothingData.oxygenLevel) }}
              </p>
            </div>

            <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-purple-600 dark:text-purple-400 font-medium">Batterie</p>
                  <p class="text-2xl font-bold text-purple-700 dark:text-purple-300">{{ Math.round(latestSmartClothingData.batteryLevel) }}%</p>
                </div>
                <span class="text-2xl">🔋</span>
              </div>
              <p class="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Signal: {{ Math.round(latestSmartClothingData.signalStrength) }}%
              </p>
            </div>
          </div>

          <!-- Smart Clothing Alerts -->
          <div *ngIf="smartClothingAlerts.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">🚨 Smart Clothing Alerts</h3>
            <div class="space-y-2">
              <div *ngFor="let alert of smartClothingAlerts.slice(0, 3)" 
                   class="p-3 rounded-lg border"
                   [ngClass]="alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                             alert.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 
                             'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{ alert.message }}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ alert.timestamp | date:'short' }}</p>
                  </div>
                  <span class="text-lg ml-2">
                    {{ alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠️' : 'ℹ️' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="mt-3">
              <button 
                (click)="clearSmartClothingAlerts()"
                class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                Clear Alerts
              </button>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">🟢 System Status: Operational</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
              <div class="text-sm text-gray-600 dark:text-gray-300">AI Services</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
              <div class="text-sm text-gray-600 dark:text-gray-300">Monitoring</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">Real-time</div>
              <div class="text-sm text-gray-600 dark:text-gray-300">Data Processing</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">Secure</div>
              <div class="text-sm text-gray-600 dark:text-gray-300">HIPAA Compliant</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button 
            (click)="navigateTo('/ai/symptoms')"
            class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105">
            <div class="text-3xl mb-2">🔍</div>
            <h3 class="font-semibold text-lg mb-1">Symptom Analysis</h3>
            <p class="text-blue-100 text-sm">AI-powered symptom assessment with real-time vital monitoring</p>
          </button>

          <button 
            (click)="navigateTo('/ai/emergency-triage')"
            class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105">
            <div class="text-3xl mb-2">🚨</div>
            <h3 class="font-semibold text-lg mb-1">Emergency Triage</h3>
            <p class="text-red-100 text-sm">Critical health monitoring and emergency response</p>
          </button>

          <button 
            (click)="testVitalDataTransmission()"
            class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105">
            <div class="text-3xl mb-2">📡</div>
            <h3 class="font-semibold text-lg mb-1">Test Vital Data</h3>
            <p class="text-green-100 text-sm">Simulate real-time vital data transmission</p>
          </button>

          <button 
            (click)="navigateTo('/ai/smart-clothing-test')"
            class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105">
            <div class="text-3xl mb-2">👕</div>
            <h3 class="font-semibold text-lg mb-1">Smart Clothing Test</h3>
            <p class="text-purple-100 text-sm">Test smart clothing simulator with real-time data</p>
          </button>
        </div>

        <!-- AI Features Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Real-Time Vital Monitoring -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span class="text-2xl mr-2">🩺</span>
              Real-Time Vital Monitoring
            </h3>
            <div class="space-y-3">
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700 dark:text-gray-300">Heart rate monitoring</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700 dark:text-gray-300">Body temperature tracking</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700 dark:text-gray-300">Blood oxygen level (SpO2)</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700 dark:text-gray-300">Blood pressure monitoring</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700 dark:text-gray-300">Activity data analysis</span>
              </div>
            </div>
          </div>

          <!-- AI-Powered Analysis -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span class="text-2xl mr-2">🤖</span>
              AI-Powered Analysis
            </h3>
            <div class="space-y-3">
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700 dark:text-gray-300">Early warning detection</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700 dark:text-gray-300">Abnormal pattern recognition</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700 dark:text-gray-300">Predictive health insights</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700 dark:text-gray-300">Personalized recommendations</span>
              </div>
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700 dark:text-gray-300">Emergency alert system</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Test Results -->
        <div *ngIf="testResults" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8 border border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">🧪 Test Results</h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <pre class="text-sm text-gray-800 dark:text-gray-200">{{ testResults | json }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AiDashboardComponent implements OnInit {
  public Math = Math;
  testResults: any = null;
  isSmartClothingActive: boolean = false;
  latestSmartClothingData: SmartClothingData | null = null;
  smartClothingAlerts: SmartClothingAlert[] = [];

  constructor(
    private router: Router,
    private wearableService: WearableService,
    private smartClothingService: SmartClothingSimulatorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    console.log('AI Dashboard initialized');
    if (isPlatformBrowser(this.platformId)) {
      console.log('Current route:', window.location.pathname);
    }

    // Subscribe to smart clothing data
    this.smartClothingService.vitalData$.subscribe(data => {
      if (data.length > 0) {
        this.latestSmartClothingData = data[data.length - 1];
      }
    });

    // Subscribe to smart clothing alerts
    this.smartClothingService.alerts$.subscribe(alerts => {
      this.smartClothingAlerts = alerts;
    });

    // Check if smart clothing simulation is active
    this.isSmartClothingActive = this.smartClothingService.isSimulatingActive();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  toggleSmartClothingSimulation(): void {
    if (this.isSmartClothingActive) {
      this.smartClothingService.stopSimulation();
      this.isSmartClothingActive = false;
    } else {
      this.smartClothingService.startSimulation(30); // Send data every 30 seconds
      this.isSmartClothingActive = true;
    }
  }

  simulateEmergency(): void {
    this.smartClothingService.simulateEmergency();
    console.log('🚨 Emergency situation simulated');
  }

  clearSmartClothingAlerts(): void {
    this.smartClothingService.clearAlerts();
  }

  testVitalDataTransmission(): void {
    console.log('Testing vital data transmission');
    
    // Generate test vital data
    const testData: VitalData = {
      timestamp: new Date().toISOString(),
      heartRate: 75 + Math.floor(Math.random() * 20),
      temperature: 36.8 + (Math.random() - 0.5) * 2,
      oxygenLevel: 97 + Math.floor(Math.random() * 3),
      bloodPressure: {
        systolic: 120 + Math.floor(Math.random() * 20),
        diastolic: 80 + Math.floor(Math.random() * 15)
      },
      activityData: {
        steps: Math.floor(Math.random() * 10000),
        sleepHours: 6 + Math.random() * 4,
        calories: Math.floor(Math.random() * 2000)
      },
      deviceId: 'test-device-001',
      userId: 'test-user-123'
    };

    // Send test data for analysis
    this.wearableService.sendVitalData(testData).subscribe({
      next: (result) => {
        this.testResults = {
          timestamp: new Date().toISOString(),
          sentData: testData,
          analysisResult: result,
          status: 'success'
        };
        console.log('Vital data transmission test successful:', result);
      },
      error: (error) => {
        this.testResults = {
          timestamp: new Date().toISOString(),
          sentData: testData,
          error: error.message,
          status: 'error'
        };
        console.error('Vital data transmission test failed:', error);
      }
    });
  }

  // Helper methods for smart clothing data status
  getTemperatureStatus(temperature: number): string {
    if (temperature < 36.0) return 'Hypothermie';
    if (temperature > 37.5) return 'Fièvre';
    return 'Normal';
  }

  getHeartRateStatus(heartRate: number): string {
    if (heartRate < 60) return 'Bradycardie';
    if (heartRate > 100) return 'Tachycardie';
    return 'Normal';
  }

  getOxygenStatus(oxygenLevel: number): string {
    if (oxygenLevel < 95) return 'Faible Oxygène';
    return 'Normal';
  }
} 