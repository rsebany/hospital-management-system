import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-insurance-providers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto py-12 px-4">
      <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">Insurance Providers</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-2">
            <svg class="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2" /></svg>
          </div>
          <span class="text-secondary-800 font-medium">Provider A</span>
        </div>
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-2">
            <svg class="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" stroke-width="2" /></svg>
          </div>
          <span class="text-secondary-800 font-medium">Provider B</span>
        </div>
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-2">
            <svg class="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="12,2 22,22 2,22" stroke-width="2" /></svg>
          </div>
          <span class="text-secondary-800 font-medium">Provider C</span>
        </div>
      </div>
    </div>
  `
})
export class InsuranceProvidersComponent {
  // Add any necessary component logic here
} 