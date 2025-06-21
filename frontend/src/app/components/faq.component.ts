import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto py-12 px-4">
      <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">Frequently Asked Questions</h2>
      <div *ngFor="let faq of faqs; let i = index" class="mb-4">
        <button (click)="toggle(i)" class="w-full text-left bg-primary-100 px-4 py-3 rounded-lg font-medium text-primary-800 focus:outline-none">
          {{ faq.question }}
        </button>
        <div *ngIf="openIndex === i" class="bg-white px-4 py-3 border border-primary-100 rounded-b-lg text-secondary-700">
          {{ faq.answer }}
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FAQComponent {
  faqs = [
    { question: 'What are your visiting hours?', answer: 'Our visiting hours are from 8am to 8pm daily.' },
    { question: 'Do you accept insurance?', answer: 'Yes, we accept a wide range of insurance providers.' },
    { question: 'How do I book an appointment?', answer: 'You can book an appointment online or by calling our front desk.' },
  ];
  openIndex: number | null = null;
  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }
} 