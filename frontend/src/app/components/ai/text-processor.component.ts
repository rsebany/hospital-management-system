import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, TextProcessingRequest, TextProcessingResult } from '../../services/ai.service';

@Component({
  selector: 'app-text-processor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📝 Medical Text Processor
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Process, summarize, and extract insights from medical documents and reports
          </p>
        </div>

        <!-- Processing Options -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Processing Type</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label class="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input 
                type="radio" 
                [(ngModel)]="processingType" 
                value="summarize" 
                name="processingType"
                class="mr-3 text-indigo-600">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Summarize</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Create concise summaries</div>
              </div>
            </label>
            
            <label class="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input 
                type="radio" 
                [(ngModel)]="processingType" 
                value="extract" 
                name="processingType"
                class="mr-3 text-indigo-600">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Extract Data</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Extract key information</div>
              </div>
            </label>
            
            <label class="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input 
                type="radio" 
                [(ngModel)]="processingType" 
                value="analyze" 
                name="processingType"
                class="mr-3 text-indigo-600">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Analyze</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Deep analysis & insights</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Text Input -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Input Text</h2>
          
          <!-- File Upload -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Document (TXT, PDF, DOC)
            </label>
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input 
                type="file" 
                (change)="onFileSelected($event)"
                accept=".txt,.pdf,.doc,.docx"
                class="hidden"
                #fileInput>
              <div class="space-y-2">
                <span class="text-4xl">📄</span>
                <p class="text-gray-600 dark:text-gray-300">
                  Drag and drop your document here, or 
                  <button 
                    type="button"
                    (click)="fileInput.click()"
                    class="text-indigo-600 hover:text-indigo-700 font-medium">
                    browse files
                  </button>
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: TXT, PDF, DOC, DOCX (max 10MB)
                </p>
              </div>
            </div>
          </div>

          <!-- Manual Text Input -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Or Enter Text Manually
            </label>
            <textarea 
              [(ngModel)]="inputText" 
              rows="8"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Paste your medical text here..."></textarea>
          </div>

          <!-- Sample Text Button -->
          <div class="mb-6">
            <button 
              type="button"
              (click)="loadSampleText()"
              class="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Load Sample Medical Text
            </button>
          </div>

          <!-- Process Button -->
          <div class="text-center">
            <button 
              (click)="processText()"
              [disabled]="isLoading || (!inputText.trim() && !fileData)"
              class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto">
              <span *ngIf="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
              {{ isLoading ? 'Processing...' : 'Process Text' }}
            </button>
          </div>
        </div>

        <!-- Processing Results -->
        <div *ngIf="processingResult" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span class="text-2xl mr-2">📊</span>
            Processing Results
          </h2>

          <!-- Summary -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p class="text-gray-800 dark:text-gray-200">{{ processingResult.summary }}</p>
            </div>
          </div>

          <!-- Key Points -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Points</h3>
            <div class="space-y-2">
              <div *ngFor="let point of processingResult.keyPoints; let i = index" 
                   class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div class="flex items-start">
                  <span class="text-green-600 dark:text-green-400 font-bold mr-3">{{ i + 1 }}.</span>
                  <p class="text-gray-800 dark:text-gray-200">{{ point }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Extracted Data -->
          <div *ngIf="processingResult.extractedData" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Extracted Data</h3>
            <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <pre class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ processingResult.extractedData | json }}</pre>
            </div>
          </div>

          <!-- Export Results -->
          <div class="mt-6 flex justify-center space-x-4">
            <button 
              (click)="exportResults()"
              class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Export Results
            </button>
            <button 
              (click)="copyToClipboard()"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Copy to Clipboard
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
export class TextProcessorComponent {
  processingType: string = 'summarize';
  inputText: string = '';
  fileData: any = null;
  processingResult: TextProcessingResult | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private aiService: AiService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.inputText = e.target.result;
        this.fileData = file;
        this.errorMessage = '';
      };
      reader.readAsText(file);
    }
  }

  loadSampleText(): void {
    this.inputText = `Patient Medical Report

Patient Name: John Doe
Date of Birth: 1985-03-15
Date of Visit: 2024-01-20

Chief Complaint: Patient presents with persistent chest pain and shortness of breath for the past 3 days.

History of Present Illness: The patient is a 39-year-old male with no significant medical history who began experiencing chest pain 3 days ago. The pain is described as pressure-like, located in the center of the chest, and radiates to the left arm. The pain is worse with physical activity and relieved with rest. Associated symptoms include shortness of breath, fatigue, and mild nausea.

Physical Examination:
- Vital Signs: BP 140/90, HR 88, RR 18, Temp 98.6°F, O2 Sat 96%
- Cardiovascular: Regular rate and rhythm, no murmurs, gallops, or rubs
- Respiratory: Clear to auscultation bilaterally
- Abdomen: Soft, non-tender, non-distended

Laboratory Results:
- CBC: WBC 8.2, Hgb 14.2, Plt 250
- Chemistry: Na 140, K 4.0, Cl 102, CO2 24, BUN 15, Cr 0.9
- Troponin: 0.02 ng/mL (normal <0.04)
- ECG: Normal sinus rhythm, no ST changes

Assessment: Atypical chest pain, rule out coronary artery disease

Plan: 
1. Stress test scheduled for next week
2. Continue current medications
3. Follow up in 1 week
4. Return immediately if symptoms worsen

Medications: Aspirin 81mg daily, Atorvastatin 20mg daily`;
  }

  processText(): void {
    if (!this.processingType) {
      this.errorMessage = 'Please select a processing type.';
      return;
    }

    if (!this.inputText.trim() && !this.fileData) {
      this.errorMessage = 'Please provide text to process.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.processingResult = null;

    const request: TextProcessingRequest = {
      text: this.inputText,
      processingType: this.processingType as any
    };

    this.aiService.processText(request).subscribe({
      next: (result) => {
        this.processingResult = result;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'An error occurred while processing the text. Please try again.';
        this.isLoading = false;
        console.error('Text processing error:', error);
      }
    });
  }

  exportResults(): void {
    if (!this.processingResult) return;
    
    const report = {
      processingType: this.processingType,
      timestamp: new Date().toISOString(),
      summary: this.processingResult.summary,
      keyPoints: this.processingResult.keyPoints,
      extractedData: this.processingResult.extractedData
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-processing-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  copyToClipboard(): void {
    if (!this.processingResult) return;
    
    const text = `Summary: ${this.processingResult.summary}\n\nKey Points:\n${this.processingResult.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}`;
    
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Results copied to clipboard');
    });
  }
} 