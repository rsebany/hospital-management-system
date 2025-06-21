  import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AiService, SymptomAnalysisRequest, SymptomAnalysisResult, WellnessRecommendationResult } from '../../services/ai.service';
import { WearableService, VitalData } from '../../services/wearable.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-symptom-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🔍 AI Symptom Analyzer
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Advanced AI-powered symptom analysis with real-time vital monitoring
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Manual Symptom Analysis -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span class="text-2xl mr-2">📝</span>
              Manual Symptom Analysis
            </h2>

            <!-- Test Login Button -->
            <div *ngIf="!isLoggedIn" class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🔑 Authentication Required</h3>
                  <p class="text-sm text-yellow-700 dark:text-yellow-300">
                    You need to be logged in to analyze symptoms. Use the test login button below.
                  </p>
                </div>
                <button 
                  (click)="testLogin()"
                  class="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Test Login
                </button>
              </div>
            </div>

            <!-- Success Message -->
            <div *ngIf="isLoggedIn" class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <span class="text-green-600 dark:text-green-400 text-lg mr-2">✅</span>
                  <div>
                    <h3 class="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">Authentication Successful</h3>
                    <p class="text-sm text-green-700 dark:text-green-300">
                      You are now logged in and can analyze symptoms.
                    </p>
                  </div>
                </div>
                <button 
                  (click)="refreshAuthState()"
                  class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Refresh Auth
                </button>
              </div>
            </div>

            <form (ngSubmit)="analyzeSymptoms()" #symptomForm="ngForm">
              <!-- Age -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age *
                </label>
                <input 
                  type="number" 
                  [(ngModel)]="symptomData.patientAge" 
                  name="patientAge"
                  min="0" 
                  max="120"
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              </div>

              <!-- Gender -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender *
                </label>
                <select 
                  [(ngModel)]="symptomData.gender" 
                  name="gender"
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Symptoms -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Symptoms Description *
                </label>
                <textarea 
                  [(ngModel)]="symptomData.symptoms" 
                  name="symptoms"
                  rows="6"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Please describe your symptoms in detail. Include:&#10;- What symptoms you're experiencing&#10;- When they started&#10;- How severe they are&#10;- Any triggers or patterns&#10;- Duration of symptoms"
                  required></textarea>
              </div>

              <!-- Medical History -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Medical History (Optional)
                </label>
                <textarea 
                  [(ngModel)]="medicalHistoryText" 
                  name="medicalHistory"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Any relevant medical history, allergies, or current medications"></textarea>
              </div>

              <!-- Submit Button -->
              <div class="text-center">
                <button 
                  type="submit"
                  [disabled]="isLoading || !symptomForm.valid"
                  class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto">
                  <span *ngIf="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  {{ isLoading ? 'Analyzing...' : 'Analyze Symptoms' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Real-Time Vital Monitoring -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span class="text-2xl mr-2">🩺</span>
              Real-Time Vital Monitoring
            </h2>

            <!-- Monitoring Controls -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" [ngClass]="isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"></div>
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{ isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive' }}
                  </span>
                </div>
                <button 
                  (click)="toggleMonitoring()"
                  [class]="isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
                  class="text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  {{ isMonitoring ? 'Stop Monitoring' : 'Start Monitoring' }}
                </button>
              </div>
            </div>

            <!-- Current Vital Data -->
            <div *ngIf="latestVitalData" class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-red-600 dark:text-red-400 font-medium">Heart Rate</p>
                    <p class="text-2xl font-bold text-red-700 dark:text-red-300">{{ latestVitalData.heartRate }} bpm</p>
                  </div>
                  <span class="text-2xl">❤️</span>
                </div>
                <p class="text-xs text-red-600 dark:text-red-400 mt-1">
                  {{ getHeartRateStatus(latestVitalData.heartRate) }}
                </p>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">Temperature</p>
                    <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ latestVitalData.temperature }}°C</p>
                  </div>
                  <span class="text-2xl">🌡️</span>
                </div>
                <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {{ getTemperatureStatus(latestVitalData.temperature) }}
                </p>
              </div>

              <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-green-600 dark:text-green-400 font-medium">Oxygen Level</p>
                    <p class="text-2xl font-bold text-green-700 dark:text-green-300">{{ latestVitalData.oxygenLevel }}%</p>
                  </div>
                  <span class="text-2xl">🫁</span>
                </div>
                <p class="text-xs text-green-600 dark:text-green-400 mt-1">
                  {{ getOxygenStatus(latestVitalData.oxygenLevel) }}
                </p>
              </div>

              <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-purple-600 dark:text-purple-400 font-medium">Blood Pressure</p>
                    <p class="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {{ latestVitalData.bloodPressure?.systolic }}/{{ latestVitalData.bloodPressure?.diastolic }}
                    </p>
                  </div>
                  <span class="text-2xl">💓</span>
                </div>
                <p class="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {{ getBloodPressureStatus(latestVitalData.bloodPressure!) }}
                </p>
              </div>
            </div>

            <!-- Vital Analysis Results -->
            <div *ngIf="vitalAnalysisResult" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Vital Analysis Results</h3>
              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p class="text-gray-800 dark:text-gray-200">{{ vitalAnalysisResult.analysis }}</p>
              </div>
            </div>

            <!-- Current Alerts -->
            <div *ngIf="currentAlerts.length > 0" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">🚨 Current Alerts</h3>
              <div class="space-y-2">
                <div *ngFor="let alert of currentAlerts.slice(0, 3)" 
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
                  (click)="clearAlerts()"
                  class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Clear Alerts
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Manual Analysis Results -->
        <div *ngIf="analysisResult" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mt-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span class="text-2xl mr-2">🤖</span>
            AI Analysis Results
          </h2>

          <!-- Risk Level -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Risk Assessment</h3>
            <div class="flex items-center">
              <div class="px-4 py-2 rounded-lg font-semibold text-white"
                   [ngClass]="analysisResult?.analysis.riskLevel === 'High' ? 'bg-red-500' : 
                             analysisResult?.analysis.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'">
                {{ analysisResult?.analysis.riskLevel || 'Unknown' }} Risk
              </div>
              <div class="ml-4 flex space-x-4">
                <div *ngIf="analysisResult?.analysis.urgentCare" class="flex items-center text-red-600 dark:text-red-400">
                  <span class="text-lg mr-1">🚨</span>
                  <span class="text-sm font-medium">Urgent Care Recommended</span>
                </div>
                <div *ngIf="analysisResult?.analysis.emergencyCare" class="flex items-center text-red-600 dark:text-red-400">
                  <span class="text-lg mr-1">🚑</span>
                  <span class="text-sm font-medium">Emergency Care Required</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Possible Conditions -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Possible Conditions</h3>
            <div class="space-y-4">
              <div *ngFor="let condition of analysisResult?.analysis.possibleConditions; let i = index" 
                   class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {{ condition.condition }}
                    </h4>
                    <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <span class="flex items-center">
                        <span class="w-2 h-2 rounded-full mr-2"
                              [ngClass]="condition.severity === 'Severe' ? 'bg-red-500' : 
                                        condition.severity === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'"></span>
                        {{ condition.severity }} Severity
                      </span>
                      <span class="flex items-center">
                        <span class="text-blue-600 dark:text-blue-400 font-medium">{{ (condition.probability * 100).toFixed(0) }}%</span>
                        <span class="ml-1">probability</span>
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="w-16 h-16 rounded-full border-4 flex items-center justify-center"
                         [ngClass]="condition.severity === 'Severe' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 
                                   condition.severity === 'Moderate' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 
                                   'border-green-500 bg-green-50 dark:bg-green-900/20'">
                      <span class="text-lg font-bold"
                            [ngClass]="condition.severity === 'Severe' ? 'text-red-600 dark:text-red-400' : 
                                      condition.severity === 'Moderate' ? 'text-yellow-600 dark:text-yellow-400' : 
                                      'text-green-600 dark:text-green-400'">
                        {{ (condition.probability * 100).toFixed(0) }}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Symptoms -->
                <div class="mb-3">
                  <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Associated Symptoms:</h5>
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let symptom of condition.symptoms" 
                          class="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                      {{ symptom }}
                    </span>
                  </div>
                </div>

                <!-- Recommendations -->
                <div>
                  <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations:</h5>
                  <ul class="space-y-1">
                    <li *ngFor="let rec of condition.recommendations; let j = index" 
                        class="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <span class="text-blue-500 dark:text-blue-400 mr-2">•</span>
                      <span>{{ rec }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Follow-up Instructions -->
          <div *ngIf="analysisResult?.analysis.followUp" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Follow-up Instructions</h3>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div class="flex items-start">
                <span class="text-blue-600 dark:text-blue-400 text-lg mr-2">📋</span>
                <p class="text-gray-800 dark:text-gray-200">{{ analysisResult?.analysis.followUp }}</p>
              </div>
            </div>
          </div>

          <!-- Disclaimer -->
          <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div class="flex items-start">
              <span class="text-yellow-600 dark:text-yellow-400 text-lg mr-2">⚠️</span>
              <div>
                <p class="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">Important Disclaimer</p>
                <p class="text-sm text-yellow-700 dark:text-yellow-300">
                  {{ analysisResult?.analysis.disclaimer || 'This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Analysis Timestamp -->
          <div *ngIf="analysisResult?.analysis.timestamp" class="mt-4 text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Analysis performed at: {{ analysisResult?.analysis.timestamp | date:'medium' }}
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-6">
          <div class="flex items-center">
            <span class="text-red-600 dark:text-red-400 text-lg mr-2">❌</span>
            <p class="text-red-800 dark:text-red-200">{{ errorMessage }}</p>
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
export class SymptomAnalyzerComponent implements OnInit, OnDestroy {
  symptomData: SymptomAnalysisRequest = {
    symptoms: '',
    patientAge: 0,
    gender: 'male',
    medicalHistory: []
  };

  medicalHistoryText: string = '';
  analysisResult: SymptomAnalysisResult | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  isLoggedIn: boolean = false;

  // Wearable data
  isMonitoring: boolean = false;
  latestVitalData: VitalData | null = null;
  vitalAnalysisResult: any = null;
  currentAlerts: any[] = [];
  wellnessRecommendations: WellnessRecommendationResult[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private aiService: AiService,
    private wearableService: WearableService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      console.log('🔐 AuthService.isLoggedIn() observable emitted:', isLoggedIn);
      this.isLoggedIn = isLoggedIn;
    });

    // Also check authentication status synchronously
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('🔐 Synchronous auth check:', isAuthenticated);
    
    // If there's a mismatch, update the observable state
    if (isAuthenticated !== this.isLoggedIn) {
      console.log('⚠️ Auth state mismatch detected, syncing...');
      this.isLoggedIn = isAuthenticated;
    }

    // Subscribe to vital data updates
    this.subscriptions.push(
      this.wearableService.vitalData$.subscribe(data => {
        if (data.length > 0) {
          this.latestVitalData = data[data.length - 1];
        }
      })
    );

    // Subscribe to alerts
    this.subscriptions.push(
      this.wearableService.alerts$.subscribe(alerts => {
        this.currentAlerts = alerts;
      })
    );

    // Check if monitoring is already active
    this.isMonitoring = this.wearableService.isMonitoringActive();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMonitoring(): void {
    if (this.isMonitoring) {
      this.wearableService.stopMonitoring();
      this.isMonitoring = false;
    } else {
      this.wearableService.startMonitoring(2); // Monitor every 2 minutes for demo
      this.isMonitoring = true;
    }
  }

  clearAlerts(): void {
    this.wearableService.clearAlerts();
  }

  analyzeSymptoms(): void {
    console.log('Analyzing symptoms...', this.symptomData);
    
    if (!this.symptomData.symptoms || !this.symptomData.patientAge || !this.symptomData.gender) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Check authentication status before making the request
    const isAuthenticated = this.authService.isAuthenticated();
    const token = this.authService.getToken();
    console.log('🔑 Current token:', token ? `${token.substring(0, 20)}...` : 'No token found');
    console.log('🔐 Is authenticated:', isAuthenticated);
    console.log('🔐 Is logged in (observable):', this.isLoggedIn);

    if (!isAuthenticated || !token) {
      this.errorMessage = 'You must be logged in to analyze symptoms. Please use the test login button above.';
      console.log('❌ Authentication check failed - redirecting to login');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.analysisResult = null;

    // Convert medical history text to array
    if (this.medicalHistoryText.trim()) {
      this.symptomData.medicalHistory = this.medicalHistoryText.split('\n').filter(line => line.trim());
    }

    console.log('Sending symptom data to AI service:', this.symptomData);

    this.aiService.analyzeSymptoms(this.symptomData).subscribe({
      next: (result) => {
        console.log('✅ Symptom analysis result:', result);
        this.analysisResult = result;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Symptom analysis error:', error);
        
        // Provide more specific error messages based on the error type
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please log in again using the test login button.';
          console.log('🔑 Token might be expired or invalid. Current token:', token ? `${token.substring(0, 20)}...` : 'No token');
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to use this feature.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = `An error occurred while analyzing symptoms: ${error.message || 'Unknown error'}`;
        }
        
        this.isLoading = false;
      }
    });
  }

  // Helper methods for vital data status
  getHeartRateStatus(heartRate: number): string {
    if (heartRate < 60) return 'Bradycardia';
    if (heartRate > 100) return 'Tachycardia';
    return 'Normal';
  }

  getTemperatureStatus(temperature: number): string {
    if (temperature < 36.0) return 'Hypothermia';
    if (temperature > 37.5) return 'Fever';
    return 'Normal';
  }

  getOxygenStatus(oxygenLevel: number): string {
    if (oxygenLevel < 95) return 'Low Oxygen';
    return 'Normal';
  }

  getBloodPressureStatus(bp: { systolic: number; diastolic: number }): string {
    if (bp.systolic > 140 || bp.diastolic > 90) return 'Elevated';
    if (bp.systolic < 90 || bp.diastolic < 60) return 'Low';
    return 'Normal';
  }

  testLogin(): void {
    console.log('🔑 Attempting test login...');
    
    // Test credentials from seed data
    const testCredentials = {
      email: 'admin@hospital.com',
      password: 'AdminPass123!'
    };

    console.log('📧 Using test credentials:', testCredentials.email);

    this.authService.login(testCredentials).subscribe({
      next: (response) => {
        console.log('✅ Test login successful:', response);
        
        // Update the local state
        this.isLoggedIn = true;
        
        // Verify token was stored
        const token = this.authService.getToken();
        console.log('🔑 Token stored:', token ? `${token.substring(0, 20)}...` : 'No token stored');
        
        // Verify authentication state
        const isAuthenticated = this.authService.isAuthenticated();
        console.log('🔐 Authentication state after login:', isAuthenticated);
        
        // Test the AI endpoint to verify authentication works
        this.testAiEndpoint();
        
        alert('Test login successful! You can now analyze symptoms.');
      },
      error: (error) => {
        console.error('❌ Test login failed:', error);
        
        let errorMessage = 'Test login failed. ';
        if (error.status === 401) {
          errorMessage += 'Invalid credentials. Please check if the backend is running and seeded.';
        } else if (error.status === 0) {
          errorMessage += 'Cannot connect to backend. Please ensure the backend server is running on port 3000.';
        } else {
          errorMessage += `Error: ${error.message || 'Unknown error'}`;
        }
        
        alert(errorMessage);
      }
    });
  }

  // Method to test AI endpoint after login
  testAiEndpoint(): void {
    console.log('🧪 Testing AI endpoint...');
    
    const testData = {
      symptoms: 'Test symptoms',
      patientAge: 30,
      gender: 'male' as const,
      medicalHistory: []
    };

    this.aiService.analyzeSymptoms(testData).subscribe({
      next: (result) => {
        console.log('✅ AI endpoint test successful:', result);
      },
      error: (error) => {
        console.error('❌ AI endpoint test failed:', error);
        if (error.status === 401) {
          console.error('🔐 Authentication still failing for AI endpoint');
        }
      }
    });
  }

  // Method to manually refresh authentication state
  refreshAuthState(): void {
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('🔄 Refreshing auth state:', isAuthenticated);
    this.isLoggedIn = isAuthenticated;
  }
} 