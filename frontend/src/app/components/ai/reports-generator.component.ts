import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, ReportSummaryRequest, ReportSummaryResult } from '../../services/ai.service';

interface ReportTemplate {
  id: string;
  name: string;
  type: 'lab' | 'imaging' | 'consultation' | 'discharge';
  description: string;
  template: any;
}

@Component({
  selector: 'app-reports-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Medical Reports Generator
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Generate comprehensive summaries and insights from medical reports
          </p>
        </div>

        <!-- Report Type Selection -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Report Type</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label *ngFor="let template of reportTemplates" 
                   class="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                   [ngClass]="selectedTemplate?.id === template.id ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700' : ''">
              <input 
                type="radio" 
                [(ngModel)]="selectedTemplate" 
                [value]="template" 
                name="reportType"
                class="mr-3 text-teal-600">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">{{ template.name }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ template.description }}</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Report Data Input -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Report Data</h2>
          
          <!-- File Upload -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Report File (JSON, TXT, PDF)
            </label>
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input 
                type="file" 
                (change)="onFileSelected($event)"
                accept=".json,.txt,.pdf"
                class="hidden"
                #fileInput>
              <div class="space-y-2">
                <span class="text-4xl">📄</span>
                <p class="text-gray-600 dark:text-gray-300">
                  Drag and drop your report file here, or 
                  <button 
                    type="button"
                    (click)="fileInput.click()"
                    class="text-teal-600 hover:text-teal-700 font-medium">
                    browse files
                  </button>
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: JSON, TXT, PDF (max 10MB)
                </p>
              </div>
            </div>
          </div>

          <!-- Manual Data Input -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Or Enter Report Data Manually
            </label>
            <textarea 
              [(ngModel)]="reportDataText" 
              rows="8"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Enter your report data in JSON format..."></textarea>
          </div>

          <!-- Load Template Button -->
          <div class="mb-6">
            <button 
              type="button"
              (click)="loadTemplateData()"
              [disabled]="!selectedTemplate"
              class="text-teal-600 hover:text-teal-700 font-medium text-sm">
              Load Sample {{ selectedTemplate?.name }} Data
            </button>
          </div>

          <!-- Generate Button -->
          <div class="text-center">
            <button 
              (click)="generateReport()"
              [disabled]="isLoading || (!reportDataText.trim() && !fileData) || !selectedTemplate"
              class="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto">
              <span *ngIf="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
              {{ isLoading ? 'Generating Report...' : 'Generate Report' }}
            </button>
          </div>
        </div>

        <!-- Generated Report -->
        <div *ngIf="reportResult" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span class="text-2xl mr-2">📊</span>
            Generated Report Summary
          </h2>

          <!-- Summary -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Executive Summary</h3>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p class="text-gray-800 dark:text-gray-200">{{ reportResult.summary }}</p>
            </div>
          </div>

          <!-- Key Findings -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Findings</h3>
            <div class="space-y-2">
              <div *ngFor="let finding of reportResult.keyFindings; let i = index" 
                   class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div class="flex items-start">
                  <span class="text-green-600 dark:text-green-400 font-bold mr-3">{{ i + 1 }}.</span>
                  <p class="text-gray-800 dark:text-gray-200">{{ finding }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h3>
            <div class="space-y-2">
              <div *ngFor="let recommendation of reportResult.recommendations; let i = index" 
                   class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div class="flex items-start">
                  <span class="text-yellow-600 dark:text-yellow-400 font-bold mr-3">{{ i + 1 }}.</span>
                  <p class="text-gray-800 dark:text-gray-200">{{ recommendation }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Follow-up Actions -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Follow-up Actions</h3>
            <div class="space-y-2">
              <div *ngFor="let action of reportResult.followUp; let i = index" 
                   class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div class="flex items-start">
                  <span class="text-purple-600 dark:text-purple-400 font-bold mr-3">{{ i + 1 }}.</span>
                  <p class="text-gray-800 dark:text-gray-200">{{ action }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Export Options -->
          <div class="mt-6 flex justify-center space-x-4">
            <button 
              (click)="exportReport('pdf')"
              class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Export as PDF
            </button>
            <button 
              (click)="exportReport('json')"
              class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Export as JSON
            </button>
            <button 
              (click)="exportReport('text')"
              class="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Export as Text
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
export class ReportsGeneratorComponent {
  selectedTemplate: ReportTemplate | null = null;
  reportDataText: string = '';
  fileData: any = null;
  reportResult: ReportSummaryResult | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  reportTemplates: ReportTemplate[] = [
    {
      id: 'lab',
      name: 'Laboratory Report',
      type: 'lab',
      description: 'Blood tests, urine analysis, etc.',
      template: {}
    },
    {
      id: 'imaging',
      name: 'Imaging Report',
      type: 'imaging',
      description: 'X-rays, MRI, CT scans, etc.',
      template: {}
    },
    {
      id: 'consultation',
      name: 'Consultation Report',
      type: 'consultation',
      description: 'Specialist consultations',
      template: {}
    },
    {
      id: 'discharge',
      name: 'Discharge Summary',
      type: 'discharge',
      description: 'Hospital discharge reports',
      template: {}
    }
  ];

  constructor(private aiService: AiService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          this.reportDataText = e.target.result;
          this.fileData = file;
          this.errorMessage = '';
        } catch (error) {
          this.errorMessage = 'Error reading file. Please check the file format.';
        }
      };
      reader.readAsText(file);
    }
  }

  loadTemplateData(): void {
    if (!this.selectedTemplate) return;

    switch (this.selectedTemplate.type) {
      case 'lab':
        this.reportDataText = JSON.stringify({
          patientId: "P12345",
          patientName: "John Doe",
          date: "2024-01-20",
          testType: "Complete Blood Count",
          results: {
            hemoglobin: "14.2 g/dL",
            whiteBloodCells: "8.2 K/μL",
            platelets: "250 K/μL",
            glucose: "95 mg/dL",
            creatinine: "0.9 mg/dL"
          },
          referenceRanges: {
            hemoglobin: "13.5-17.5 g/dL",
            whiteBloodCells: "4.5-11.0 K/μL",
            platelets: "150-450 K/μL",
            glucose: "70-100 mg/dL",
            creatinine: "0.7-1.3 mg/dL"
          },
          abnormalResults: ["None"],
          interpretation: "All values within normal reference ranges"
        }, null, 2);
        break;

      case 'imaging':
        this.reportDataText = JSON.stringify({
          patientId: "P12345",
          patientName: "John Doe",
          date: "2024-01-20",
          examType: "Chest X-Ray",
          technique: "PA and lateral views",
          findings: {
            heart: "Normal cardiac silhouette",
            lungs: "Clear lung fields bilaterally",
            mediastinum: "Normal",
            bones: "No acute bony abnormalities"
          },
          impression: "Normal chest x-ray",
          recommendations: "No follow-up imaging required"
        }, null, 2);
        break;

      case 'consultation':
        this.reportDataText = JSON.stringify({
          patientId: "P12345",
          patientName: "John Doe",
          date: "2024-01-20",
          specialist: "Dr. Smith, Cardiologist",
          chiefComplaint: "Chest pain",
          history: "Patient reports chest pain for 3 days",
          examination: "Normal cardiovascular exam",
          assessment: "Atypical chest pain",
          plan: "Stress test scheduled, follow-up in 1 week"
        }, null, 2);
        break;

      case 'discharge':
        this.reportDataText = JSON.stringify({
          patientId: "P12345",
          patientName: "John Doe",
          admissionDate: "2024-01-15",
          dischargeDate: "2024-01-20",
          admittingDiagnosis: "Chest pain",
          dischargeDiagnosis: "Stable angina",
          procedures: ["Cardiac catheterization"],
          medications: ["Aspirin", "Atorvastatin"],
          followUp: "Cardiology appointment in 1 week"
        }, null, 2);
        break;
    }
  }

  generateReport(): void {
    if (!this.selectedTemplate) {
      this.errorMessage = 'Please select a report type.';
      return;
    }

    if (!this.reportDataText.trim() && !this.fileData) {
      this.errorMessage = 'Please provide report data.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.reportResult = null;

    let reportData: any;
    try {
      reportData = JSON.parse(this.reportDataText);
    } catch (error) {
      this.errorMessage = 'Invalid JSON format. Please check your data.';
      this.isLoading = false;
      return;
    }

    const request: ReportSummaryRequest = {
      reportType: this.selectedTemplate.type,
      reportData: reportData
    };

    this.aiService.generateReportSummary(request).subscribe({
      next: (result) => {
        this.reportResult = result;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'An error occurred while generating the report. Please try again.';
        this.isLoading = false;
        console.error('Report generation error:', error);
      }
    });
  }

  exportReport(format: string): void {
    if (!this.reportResult) return;

    const report = {
      type: this.selectedTemplate?.name,
      timestamp: new Date().toISOString(),
      summary: this.reportResult.summary,
      keyFindings: this.reportResult.keyFindings,
      recommendations: this.reportResult.recommendations,
      followUp: this.reportResult.followUp
    };

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(report, null, 2);
        filename = `medical-report-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      case 'text':
        content = `MEDICAL REPORT SUMMARY\n\nSummary: ${report.summary}\n\nKey Findings:\n${report.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nRecommendations:\n${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nFollow-up Actions:\n${report.followUp.map((f, i) => `${i + 1}. ${f}`).join('\n')}`;
        filename = `medical-report-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
      default:
        content = JSON.stringify(report, null, 2);
        filename = `medical-report-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
} 