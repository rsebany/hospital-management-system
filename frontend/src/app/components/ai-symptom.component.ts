import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-symptom',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-lg mx-auto py-12 px-4">
      <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">AI Symptom Checker</h2>
      <form (ngSubmit)="checkSymptoms()" class="mb-6">
        <label class="block text-secondary-700 mb-2">Describe your symptoms</label>
        <textarea [(ngModel)]="symptoms" name="symptoms" class="input-field h-32 mb-4" placeholder="e.g. headache, fever, cough" required></textarea>
        <button type="submit" class="btn-primary w-full">Check</button>
      </form>
      <div *ngIf="result" class="bg-primary-50 border border-primary-200 rounded-lg p-4 text-secondary-800">
        <strong>Possible causes:</strong>
        <p>{{ result }}</p>
      </div>
    </div>
  `,
  styles: []
})
export class AiSymptomComponent {
  symptoms = '';
  result: string | null = null;
  checkSymptoms() {
    // Placeholder logic
    this.result = 'This is a demo. Please consult a doctor for a real diagnosis.';
  }
} 