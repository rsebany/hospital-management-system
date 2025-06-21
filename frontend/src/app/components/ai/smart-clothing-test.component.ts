import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartClothingSimulatorService, SmartClothingData, SmartClothingAlert } from '../../services/smart-clothing-simulator.service';

@Component({
  selector: 'app-smart-clothing-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div class="container mx-auto px-4 max-w-4xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            👕 Smart Clothing Simulator Test
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Test the smart clothing simulator with real-time vital data transmission
          </p>
        </div>

        <!-- Control Panel -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">🎮 Control Panel</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button 
              (click)="startSimulation()"
              [disabled]="isSimulating"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
              🚀 Start Simulation
            </button>
            
            <button 
              (click)="stopSimulation()"
              [disabled]="!isSimulating"
              class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
              ⏹️ Stop Simulation
            </button>
            
            <button 
              (click)="simulateEmergency()"
              class="bg-red-800 hover:bg-red-900 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
              🚨 Emergency Test
            </button>
          </div>

          <div class="flex items-center justify-center">
            <div class="flex items-center">
              <div class="w-4 h-4 rounded-full mr-3" [ngClass]="isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"></div>
              <span class="text-lg font-medium text-gray-700 dark:text-gray-300">
                {{ isSimulating ? 'Simulation Active - Sending data every 30 seconds' : 'Simulation Inactive' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Current Vital Data -->
        <div *ngIf="latestData" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">📊 Current Vital Data</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-red-600 dark:text-red-400 font-medium">Température Corporelle</p>
                  <p class="text-2xl font-bold text-red-700 dark:text-red-300">{{ latestData.temperature }}°C</p>
                </div>
                <span class="text-2xl">🌡️</span>
              </div>
              <p class="text-xs text-red-600 dark:text-red-400 mt-1">
                {{ getTemperatureStatus(latestData.temperature) }}
              </p>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">Fréquence Cardiaque</p>
                  <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ latestData.heartRate }} bpm</p>
                </div>
                <span class="text-2xl">❤️</span>
              </div>
              <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {{ getHeartRateStatus(latestData.heartRate) }}
              </p>
            </div>

            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-green-600 dark:text-green-400 font-medium">Taux d'Oxygène</p>
                  <p class="text-2xl font-bold text-green-700 dark:text-green-300">{{ latestData.oxygenLevel }}%</p>
                </div>
                <span class="text-2xl">🫁</span>
              </div>
              <p class="text-xs text-green-600 dark:text-green-400 mt-1">
                {{ getOxygenStatus(latestData.oxygenLevel) }}
              </p>
            </div>

            <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-purple-600 dark:text-purple-400 font-medium">Device Status</p>
                  <p class="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {{ Math.round(latestData.batteryLevel) }}% | {{ Math.round(latestData.signalStrength) }}%
                  </p>
                </div>
                <span class="text-2xl">🔋</span>
              </div>
              <p class="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Battery | Signal
              </p>
            </div>
          </div>

          <div class="mt-4 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {{ latestData.timestamp | date:'medium' }}
            </p>
          </div>
        </div>

        <!-- Alerts -->
        <div *ngIf="alerts.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">🚨 Alerts</h2>
            <button 
              (click)="clearAlerts()"
              class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Clear All
            </button>
          </div>
          
          <div class="space-y-3">
            <div *ngFor="let alert of alerts" 
                 class="p-4 rounded-lg border"
                 [ngClass]="alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                           alert.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 
                           'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{ alert.message }}</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ alert.timestamp | date:'medium' }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Severity: {{ alert.severity }} | Action Required: {{ alert.actionRequired ? 'Yes' : 'No' }}
                  </p>
                </div>
                <span class="text-2xl ml-3">
                  {{ alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠️' : 'ℹ️' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Data History -->
        <div *ngIf="historicalData.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">📈 Data History (Last 10 readings)</h2>
          
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="text-left py-2 px-2">Time</th>
                  <th class="text-left py-2 px-2">Temp (°C)</th>
                  <th class="text-left py-2 px-2">HR (bpm)</th>
                  <th class="text-left py-2 px-2">O2 (%)</th>
                  <th class="text-left py-2 px-2">Battery (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let data of historicalData.slice(-10)" class="border-b border-gray-100 dark:border-gray-700">
                  <td class="py-2 px-2">{{ data.timestamp | date:'shortTime' }}</td>
                  <td class="py-2 px-2">{{ data.temperature }}</td>
                  <td class="py-2 px-2">{{ data.heartRate }}</td>
                  <td class="py-2 px-2">{{ data.oxygenLevel }}</td>
                  <td class="py-2 px-2">{{ Math.round(data.batteryLevel) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Instructions -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">📋 Instructions</h3>
          <div class="space-y-2 text-blue-800 dark:text-blue-200">
            <p>1. Click "Start Simulation" to begin sending vital data every 30 seconds</p>
            <p>2. The simulator will automatically generate realistic vital signs</p>
            <p>3. Abnormal values will trigger alerts automatically</p>
            <p>4. Use "Emergency Test" to simulate critical health conditions</p>
            <p>5. All data is sent to the backend for AI analysis</p>
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
export class SmartClothingTestComponent implements OnInit {
  isSimulating: boolean = false;
  latestData: SmartClothingData | null = null;
  alerts: SmartClothingAlert[] = [];
  historicalData: SmartClothingData[] = [];
  public Math = Math;

  constructor(private smartClothingService: SmartClothingSimulatorService) {}

  ngOnInit(): void {
    // Subscribe to vital data updates
    this.smartClothingService.vitalData$.subscribe(data => {
      this.historicalData = data;
      if (data.length > 0) {
        this.latestData = data[data.length - 1];
      }
    });

    // Subscribe to alerts
    this.smartClothingService.alerts$.subscribe(alerts => {
      this.alerts = alerts;
    });

    // Check if simulation is active
    this.isSimulating = this.smartClothingService.isSimulatingActive();
  }

  startSimulation(): void {
    this.smartClothingService.startSimulation(30); // Send data every 30 seconds
    this.isSimulating = true;
    console.log('🚀 Smart clothing simulation started');
  }

  stopSimulation(): void {
    this.smartClothingService.stopSimulation();
    this.isSimulating = false;
    console.log('⏹️ Smart clothing simulation stopped');
  }

  simulateEmergency(): void {
    this.smartClothingService.simulateEmergency();
    console.log('🚨 Emergency situation simulated');
  }

  clearAlerts(): void {
    this.smartClothingService.clearAlerts();
  }

  // Helper methods for status
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