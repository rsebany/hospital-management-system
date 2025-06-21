import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { PublicService, FAQ } from '../services/public.service';
import { Observable, catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    FormsModule
  ],
  template: `
    <div style="background-color: #F1F5F9; min-height: 100vh; padding: 20px;">
      <div style="max-width: 800px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #0891B2; font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
            Frequently Asked Questions
          </h1>
          <p style="color: #666; font-size: 1.2rem;">
            Find answers to common questions about our services and policies
          </p>
        </div>

        <!-- Search and Filter -->
        <div style="margin-bottom: 30px;">
          <div style="display: flex; gap: 15px; margin-bottom: 20px;">
            <input 
              type="text" 
              placeholder="Search questions..."
              [(ngModel)]="searchTerm"
              style="flex: 1; padding: 12px 16px; border: 2px solid #E2E8F0; border-radius: 8px; font-size: 16px; outline: none;"
              (input)="filterFAQs()"
            />
            <select 
              [(ngModel)]="selectedCategory"
              (change)="filterFAQs()"
              style="padding: 12px 16px; border: 2px solid #E2E8F0; border-radius: 8px; font-size: 16px; outline: none; background: white;"
            >
              <option value="">All Categories</option>
              <option *ngFor="let category of categories" [value]="category">{{category}}</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" style="text-align: center; padding: 40px;">
          <mat-spinner style="margin: 0 auto;"></mat-spinner>
          <p style="color: #666; margin-top: 20px;">Loading frequently asked questions...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" style="text-align: center; padding: 40px;">
          <mat-icon style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">error_outline</mat-icon>
          <h3 style="color: #DC2626; margin-bottom: 10px;">Unable to load FAQ</h3>
          <p style="color: #666; margin-bottom: 20px;">Please try again or contact us for assistance.</p>
          <button 
            mat-raised-button 
            style="background-color: #0891B2; color: white;"
            (click)="loadFAQ()"
          >
            Try Again
          </button>
        </div>

        <!-- FAQ List -->
        <div *ngIf="!loading && !error">
          <mat-accordion style="display: block;">
            <mat-expansion-panel 
              *ngFor="let faq of filteredFAQs" 
              style="margin-bottom: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
            >
              <mat-expansion-panel-header style="padding: 20px;">
                <mat-panel-title style="color: #0891B2; font-weight: 600; font-size: 1.1rem;">
                  {{faq.question}}
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div style="padding: 0 20px 20px;">
                <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">{{faq.answer}}</p>
                
                <!-- Category and Tags -->
                <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                  <span 
                    *ngIf="faq.category"
                    style="background-color: #E0F2FE; color: #0891B2; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: 500;"
                  >
                    {{faq.category}}
                  </span>
                  <mat-chip 
                    *ngFor="let tag of faq.tags" 
                    style="background-color: #F3E8FF; color: #8B5CF6;"
                  >
                    {{tag}}
                  </mat-chip>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>

          <!-- No Results -->
          <div *ngIf="filteredFAQs.length === 0 && !loading" style="text-align: center; padding: 40px;">
            <mat-icon style="font-size: 48px; color: #666; margin-bottom: 20px;">search_off</mat-icon>
            <h3 style="color: #666; margin-bottom: 10px;">No questions found</h3>
            <p style="color: #999;">Try adjusting your search terms or browse all categories.</p>
          </div>
        </div>

        <!-- Contact Section -->
        <div style="margin-top: 40px; background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <h3 style="color: #0891B2; margin-bottom: 15px; font-size: 1.5rem;">Still have questions?</h3>
          <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
            Can't find what you're looking for? Our team is here to help you get the information you need.
          </p>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button 
              mat-raised-button 
              style="background-color: #0891B2; color: white;"
              (click)="contactUs()"
            >
              <mat-icon style="margin-right: 8px;">email</mat-icon>
              Contact Us
            </button>
            <button 
              mat-stroked-button 
              style="border-color: #0891B2; color: #0891B2;"
              (click)="callUs()"
            >
              <mat-icon style="margin-right: 8px;">phone</mat-icon>
              Call Us
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FAQComponent implements OnInit {
  private publicService = inject(PublicService);
  private snackBar = inject(MatSnackBar);

  faqData$: Observable<FAQ[]> = this.publicService.getFAQ().pipe(
    catchError(error => {
      console.error('Error loading FAQ:', error);
      this.error = true;
      return of([]);
    }),
    finalize(() => {
      this.loading = false;
    })
  );

  loading = true;
  error = false;
  searchTerm = '';
  selectedCategory = '';
  filteredFAQs: FAQ[] = [];
  categories: string[] = [];

  ngOnInit(): void {
    this.loadFAQ();
  }

  loadFAQ(): void {
    this.loading = true;
    this.error = false;
    this.faqData$ = this.publicService.getFAQ().pipe(
      catchError(error => {
        console.error('Error loading FAQ:', error);
        this.error = true;
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    );

    this.faqData$.subscribe(faqs => {
      this.filteredFAQs = faqs;
      this.extractCategories(faqs);
    });
  }

  extractCategories(faqs: FAQ[]): void {
    const categorySet = new Set<string>();
    faqs.forEach(faq => {
      if (faq.category) {
        categorySet.add(faq.category);
      }
    });
    this.categories = Array.from(categorySet).sort();
  }

  filterFAQs(): void {
    this.faqData$.subscribe(faqs => {
      this.filteredFAQs = faqs.filter(faq => {
        const matchesSearch = !this.searchTerm || 
          faq.question.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(this.searchTerm.toLowerCase());
        
        const matchesCategory = !this.selectedCategory || 
          faq.category === this.selectedCategory;
        
        return matchesSearch && matchesCategory;
      });
    });
  }

  contactUs(): void {
    this.snackBar.open('Opening contact form...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to contact page or open contact modal
  }

  callUs(): void {
    this.snackBar.open('Calling our support team...', 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Implement phone call functionality
  }
} 