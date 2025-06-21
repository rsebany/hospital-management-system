import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wearable-data',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto py-12 px-4">
      <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">Wearable Health Data</h2>
      <div class="bg-primary-50 border border-primary-200 rounded-lg p-8 text-center">
        <p class="text-secondary-700 mb-4">Your latest health data from connected wearables will appear here.</p>
        <div class="h-40 flex items-center justify-center">
          <span class="text-primary-400">[Charts/Graphs Placeholder]</span>
        </div>
      </div>
    </div>
  `
})
export class WearableDataComponent {} 