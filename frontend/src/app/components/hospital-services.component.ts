import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hospital-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto py-12 px-4">
      <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">Our Hospital Services</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-1">Emergency Care</h3>
            <p class="text-secondary-600 text-sm">24/7 emergency services for urgent medical needs.</p>
          </div>
        </div>
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-1">Outpatient Services</h3>
            <p class="text-secondary-600 text-sm">Comprehensive outpatient care and consultations.</p>
          </div>
        </div>
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-1">Inpatient Services</h3>
            <p class="text-secondary-600 text-sm">Comfortable and modern inpatient facilities.</p>
          </div>
        </div>
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-1">Surgical Services</h3>
            <p class="text-secondary-600 text-sm">Advanced surgical procedures and post-op care.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HospitalServicesComponent {
} 