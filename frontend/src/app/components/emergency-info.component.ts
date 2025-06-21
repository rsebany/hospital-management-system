import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emergency-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-xl mx-auto py-12 px-4 text-center">
      <h2 class="text-3xl font-bold text-red-700 mb-6">Emergency Information</h2>
      <div class="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg mb-6">
        <p class="text-lg text-red-800 font-semibold">In case of emergency, call:</p>
        <p class="text-2xl font-bold text-red-900 mt-2 mb-1">+1 800 123 4567</p>
        <p class="text-sm text-red-700">Available 24/7</p>
      </div>
      <div class="text-secondary-700">
        <p>For immediate medical attention, visit our Emergency Department at the main hospital building.</p>
        <p class="mt-2">Follow the instructions of our medical staff and stay calm.</p>
      </div>
    </div>
  `
})
export class EmergencyInfoComponent {} 