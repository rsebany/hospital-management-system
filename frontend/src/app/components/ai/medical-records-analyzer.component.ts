import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, MedicalRecordsAnalysisRequest, MedicalRecordsAnalysisResult } from '../../services/ai.service';

@Component({
  selector: 'app-medical-records-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📋 Medical Records Analyzer
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Upload and analyze your medical records for patterns, insights, and trends
          </p>
        </div>

        <!-- Analysis Options -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Analysis Type</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input 
                type="radio" 
                [(ngModel)]="analysisType" 
                value="general" 
                name="analysisType"
                class="mr-3 text-blue-600">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">General Analysis</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Overall health patterns</div>
              </div>
            </label>
            
            <label class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input 
                type="radio" 
                [(ngModel)]="analysisType" 
                value="medication" 
                name="analysisType"
                class="mr-3 text-blue-600">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Medication Review</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Drug interactions & efficacy</div>
              </div>
            </label>
            
            <label class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input 
                type="radio" 
                [(ngModel)]="analysisType" 
                value="lab_results" 
                name="analysisType"
                class="mr-3 text-blue-600">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Lab Results</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Test result trends</div>
              </div>
            </label>
            
            <label class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input 
                type="radio" 
                [(ngModel)]="analysisType" 
                value="appointments" 
                name="analysisType"
                class="mr-3 text-blue-600">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Appointments</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Visit patterns & frequency</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Records Input -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Medical Records Data</h2>
          
          <!-- File Upload -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Medical Records (JSON format)
            </label>
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input 
                type="file" 
                (change)="onFileSelected($event)"
                accept=".json,.txt"
                class="hidden"
                #fileInput>
              <div class="space-y-2">
                <span class="text-4xl">📁</span>
                <p class="text-gray-600 dark:text-gray-300">
                  Drag and drop your medical records file here, or 
                  <button 
                    type="button"
                    (click)="fileInput.click()"
                    class="text-blue-600 hover:text-blue-700 font-medium">
                    browse files
                  </button>
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: JSON, TXT (max 10MB)
                </p>
              </div>
            </div>
          </div>

          <!-- Manual Data Input -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Or Enter Records Manually
            </label>
            <textarea 
              [(ngModel)]="manualRecordsData" 
              rows="8"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Enter your medical records data in JSON format or plain text..."></textarea>
          </div>

          <!-- Sample Data Button -->
          <div class="mb-6">
            <button 
              type="button"
              (click)="loadSampleData()"
              class="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Load Sample Data for Testing
            </button>
          </div>

          <!-- Analyze Button -->
          <div class="text-center">
            <button 
              (click)="analyzeRecords()"
              [disabled]="isLoading || (!hasFileData && !manualRecordsData.trim())"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto">
              <span *ngIf="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
              {{ isLoading ? 'Analyzing...' : 'Analyze Records' }}
            </button>
          </div>
        </div>

        <!-- Analysis Results -->
        <div *ngIf="analysisResult" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span class="text-2xl mr-2">📊</span>
            Analysis Results
          </h2>

          <!-- Summary -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p class="text-gray-800 dark:text-gray-200">{{ analysisResult.summary }}</p>
            </div>
          </div>

          <!-- Key Findings -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Findings</h3>
            <div class="space-y-3">
              <div *ngFor="let finding of analysisResult.findings; let i = index" 
                   class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div class="flex items-start">
                  <span class="text-green-600 dark:text-green-400 font-bold mr-3">{{ i + 1 }}.</span>
                  <p class="text-gray-800 dark:text-gray-200">{{ finding }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Export Results -->
          <div class="mt-6 flex justify-center">
            <button 
              (click)="exportResults()"
              class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Export Analysis Report
            </button>
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
export class MedicalRecordsAnalyzerComponent {
  analysisType: string = 'general';
  manualRecordsData: string = '';
  fileData: any = null;
  hasFileData: boolean = false;
  analysisResult: MedicalRecordsAnalysisResult | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private aiService: AiService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          this.fileData = JSON.parse(e.target.result);
          this.hasFileData = true;
          this.errorMessage = '';
        } catch (error) {
          this.errorMessage = 'Invalid JSON file. Please check the file format.';
          this.hasFileData = false;
        }
      };
      reader.readAsText(file);
    }
  }

  loadSampleData(): void {
    this.manualRecordsData = JSON.stringify({
      patient: {
        id: "P12345",
        name: "John Doe",
        age: 45,
        gender: "male"
      },
      records: [
        {
          date: "2024-01-15",
          type: "lab_result",
          test: "Blood Pressure",
          value: "140/90",
          unit: "mmHg",
          status: "elevated"
        },
        {
          date: "2024-02-20",
          type: "medication",
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "daily",
          prescribed_for: "hypertension"
        },
        {
          date: "2024-03-10",
          type: "appointment",
          doctor: "Dr. Smith",
          specialty: "Cardiology",
          notes: "Follow-up for hypertension management"
        }
      ]
    }, null, 2);
  }

  analyzeRecords(): void {
    if (!this.analysisType) {
      this.errorMessage = 'Please select an analysis type.';
      return;
    }

    let recordsData: any[] = [];
    
    if (this.hasFileData && this.fileData) {
      recordsData = this.fileData.records || this.fileData;
    } else if (this.manualRecordsData.trim()) {
      try {
        const parsed = JSON.parse(this.manualRecordsData);
        recordsData = parsed.records || parsed;
      } catch (error) {
        this.errorMessage = 'Invalid JSON format in manual input.';
        return;
      }
    } else {
      this.errorMessage = 'Please provide medical records data.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.analysisResult = null;

    const request: MedicalRecordsAnalysisRequest = {
      records: recordsData,
      analysisType: this.analysisType as any
    };

    this.aiService.analyzeMedicalRecords(request).subscribe({
      next: (result) => {
        this.analysisResult = result;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'An error occurred while analyzing records. Please try again.';
        this.isLoading = false;
        console.error('Records analysis error:', error);
      }
    });
  }

  exportResults(): void {
    if (!this.analysisResult) return;
    
    const report = {
      analysisType: this.analysisType,
      timestamp: new Date().toISOString(),
      summary: this.analysisResult.summary,
      findings: this.analysisResult.findings
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
} 