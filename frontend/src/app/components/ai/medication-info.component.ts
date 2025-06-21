import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';

interface MedicationInfo {
  name: string;
  genericName?: string;
  description: string;
  dosage: string;
  sideEffects: string[];
  interactions: string[];
  warnings: string[];
  category: string;
}

@Component({
  selector: 'app-medication-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            💊 Medication Information Center
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Get comprehensive information about medications, side effects, and interactions
          </p>
        </div>

        <!-- Search Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Search Medications</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Single Medication Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Single Medication
              </label>
              <div class="flex">
                <input 
                  type="text" 
                  [(ngModel)]="singleMedication" 
                  placeholder="Enter medication name (e.g., Aspirin, Lisinopril)"
                  class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                <button 
                  (click)="searchSingleMedication()"
                  [disabled]="!singleMedication.trim() || isLoading"
                  class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-r-lg transition-colors duration-200">
                  Search
                </button>
              </div>
            </div>

            <!-- Multiple Medications -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Check Drug Interactions
              </label>
              <div class="flex">
                <input 
                  type="text" 
                  [(ngModel)]="multipleMedications" 
                  placeholder="Enter medications separated by commas"
                  class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                <button 
                  (click)="checkInteractions()"
                  [disabled]="!multipleMedications.trim() || isLoading"
                  class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-r-lg transition-colors duration-200">
                  Check
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Search Buttons -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Common Medications</label>
            <div class="flex flex-wrap gap-2">
              <button 
                *ngFor="let med of commonMedications"
                (click)="searchSingleMedication(med)"
                class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors">
                {{ med }}
              </button>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div *ngIf="isLoading" class="text-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            <p class="text-gray-600 dark:text-gray-300">Searching medication database...</p>
          </div>
        </div>

        <!-- Medication Information Results -->
        <div *ngIf="medicationInfo" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span class="text-2xl mr-2">💊</span>
            {{ medicationInfo.name }}
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h3>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p class="text-gray-800 dark:text-gray-200 mb-2">
                    <strong>Generic Name:</strong> {{ medicationInfo.genericName || 'N/A' }}
                  </p>
                  <p class="text-gray-800 dark:text-gray-200 mb-2">
                    <strong>Category:</strong> {{ medicationInfo.category }}
                  </p>
                  <p class="text-gray-800 dark:text-gray-200">
                    <strong>Description:</strong> {{ medicationInfo.description }}
                  </p>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Dosage Information</h3>
                <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p class="text-gray-800 dark:text-gray-200">{{ medicationInfo.dosage }}</p>
                </div>
              </div>
            </div>

            <!-- Side Effects and Warnings -->
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Common Side Effects</h3>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <ul class="space-y-1">
                    <li *ngFor="let effect of medicationInfo.sideEffects" class="text-gray-800 dark:text-gray-200">
                      • {{ effect }}
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Important Warnings</h3>
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <ul class="space-y-1">
                    <li *ngFor="let warning of medicationInfo.warnings" class="text-gray-800 dark:text-gray-200">
                      ⚠️ {{ warning }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Drug Interactions -->
          <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Drug Interactions</h3>
            <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div *ngIf="medicationInfo.interactions.length > 0; else noInteractions">
                <ul class="space-y-2">
                  <li *ngFor="let interaction of medicationInfo.interactions" class="text-gray-800 dark:text-gray-200">
                    • {{ interaction }}
                  </li>
                </ul>
              </div>
              <ng-template #noInteractions>
                <p class="text-gray-800 dark:text-gray-200">No significant drug interactions reported.</p>
              </ng-template>
            </div>
          </div>

          <!-- Disclaimer -->
          <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div class="flex items-start">
              <span class="text-yellow-600 dark:text-yellow-400 text-lg mr-2">⚠️</span>
              <div>
                <p class="text-sm text-gray-800 dark:text-gray-200 font-medium mb-1">Important Disclaimer</p>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  This information is for educational purposes only and should not replace professional medical advice. 
                  Always consult with your healthcare provider or pharmacist for personalized medication guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Interaction Results -->
        <div *ngIf="interactionResults" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span class="text-2xl mr-2">🔗</span>
            Drug Interaction Analysis
          </h2>

          <div class="space-y-4">
            <div *ngFor="let interaction of interactionResults" 
                 class="p-4 rounded-lg border"
                 [ngClass]="interaction.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                           interaction.severity === 'moderate' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
                           'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ interaction.medications }}</h3>
                <span class="px-2 py-1 rounded text-xs font-medium"
                      [ngClass]="interaction.severity === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' : 
                                interaction.severity === 'moderate' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' : 
                                'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'">
                  {{ interaction.severity | titlecase }}
                </span>
              </div>
              <p class="text-gray-800 dark:text-gray-200">{{ interaction.description }}</p>
              <p *ngIf="interaction.recommendation" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <strong>Recommendation:</strong> {{ interaction.recommendation }}
              </p>
            </div>
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
export class MedicationInfoComponent {
  singleMedication: string = '';
  multipleMedications: string = '';
  medicationInfo: MedicationInfo | null = null;
  interactionResults: any[] | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  commonMedications = [
    'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Lisinopril', 'Metformin',
    'Atorvastatin', 'Omeprazole', 'Amlodipine', 'Losartan', 'Metoprolol'
  ];

  constructor(private aiService: AiService) {}

  searchSingleMedication(medication?: string): void {
    const searchTerm = medication || this.singleMedication;
    if (!searchTerm.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.medicationInfo = null;
    this.interactionResults = null;

    // Simulate API call
    setTimeout(() => {
      this.medicationInfo = this.generateMedicationInfo(searchTerm);
      this.isLoading = false;
    }, 1500);
  }

  checkInteractions(): void {
    if (!this.multipleMedications.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.medicationInfo = null;
    this.interactionResults = null;

    // Simulate API call
    setTimeout(() => {
      this.interactionResults = this.generateInteractionResults(this.multipleMedications);
      this.isLoading = false;
    }, 1500);
  }

  generateMedicationInfo(medication: string): MedicationInfo {
    const med = medication.toLowerCase();
    
    if (med.includes('aspirin')) {
      return {
        name: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        description: 'A nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain, fever, and inflammation.',
        dosage: 'Typical dosage: 325-650mg every 4-6 hours as needed. Do not exceed 4g per day.',
        sideEffects: [
          'Stomach upset or heartburn',
          'Nausea and vomiting',
          'Stomach ulcers',
          'Increased bleeding risk',
          'Ringing in ears (tinnitus)'
        ],
        interactions: [
          'Blood thinners (increased bleeding risk)',
          'Other NSAIDs (increased side effects)',
          'Alcohol (increased stomach irritation)',
          'ACE inhibitors (reduced effectiveness)'
        ],
        warnings: [
          'Do not use if you have bleeding disorders',
          'Avoid before surgery',
          'Not recommended for children under 12',
          'May cause Reye syndrome in children with viral infections'
        ],
        category: 'NSAID, Antiplatelet'
      };
    }
    
    if (med.includes('lisinopril')) {
      return {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        description: 'An ACE inhibitor used to treat high blood pressure and heart failure.',
        dosage: 'Typical dosage: 10-40mg once daily. Take on an empty stomach.',
        sideEffects: [
          'Dry cough',
          'Dizziness or lightheadedness',
          'Fatigue',
          'Headache',
          'Nausea'
        ],
        interactions: [
          'Diuretics (increased blood pressure lowering)',
          'Lithium (increased lithium levels)',
          'NSAIDs (reduced effectiveness)',
          'Potassium supplements (increased potassium levels)'
        ],
        warnings: [
          'Do not use during pregnancy',
          'Monitor potassium levels',
          'May cause angioedema',
          'Avoid salt substitutes containing potassium'
        ],
        category: 'ACE Inhibitor'
      };
    }
    
    // Default response
    return {
      name: medication,
      description: 'This medication information is for educational purposes. Please consult with your healthcare provider for specific information.',
      dosage: 'Dosage varies by individual. Consult your healthcare provider.',
      sideEffects: ['Side effects vary by individual. Consult your healthcare provider.'],
      interactions: ['Consult your healthcare provider for drug interaction information.'],
      warnings: ['Always consult with your healthcare provider before taking any medication.'],
      category: 'Prescription Medication'
    };
  }

  generateInteractionResults(medications: string): any[] {
    const medList = medications.split(',').map(m => m.trim());
    
    if (medList.length < 2) {
      return [];
    }

    const interactions = [];
    
    // Check for common interactions
    if (medList.some(m => m.toLowerCase().includes('aspirin')) && 
        medList.some(m => m.toLowerCase().includes('ibuprofen'))) {
      interactions.push({
        medications: 'Aspirin + Ibuprofen',
        severity: 'moderate',
        description: 'Taking both NSAIDs together may increase the risk of stomach irritation and bleeding.',
        recommendation: 'Avoid taking both medications simultaneously. Space them apart by several hours.'
      });
    }
    
    if (medList.some(m => m.toLowerCase().includes('lisinopril')) && 
        medList.some(m => m.toLowerCase().includes('aspirin'))) {
      interactions.push({
        medications: 'Lisinopril + Aspirin',
        severity: 'low',
        description: 'Aspirin may reduce the blood pressure lowering effects of lisinopril.',
        recommendation: 'Monitor blood pressure closely. Consult your healthcare provider.'
      });
    }

    // Add generic interaction warning
    if (interactions.length === 0) {
      interactions.push({
        medications: medList.join(' + '),
        severity: 'unknown',
        description: 'No known interactions found in our database, but this does not guarantee safety.',
        recommendation: 'Always consult with your healthcare provider or pharmacist about potential interactions.'
      });
    }

    return interactions;
  }
} 