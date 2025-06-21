import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PublicService, HospitalInfo, Department, Doctor } from '../services/public.service';
import { Observable, catchError, of, finalize } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { CountUpModule } from 'ngx-countup';

@Component({
  selector: 'app-public-info',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    NgOptimizedImage,
    CountUpModule
  ],
  template: `
    <div class="min-h-screen bg-blue-50">
      <!-- Hero Section -->
      <section class="relative h-screen flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0">
          <div class="w-full h-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"></div>
          <div class="absolute inset-0 bg-white bg-opacity-20"></div>
        </div>
        
        <div class="relative z-10 text-center px-6 w-full max-w-4xl mx-auto">
          <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Welcome to <span class="text-blue-600">Hopitaliko</span>
          </h1>
          
          <p class="text-lg sm:text-xl md:text-2xl mb-8 text-blue-800 mx-auto max-w-2xl leading-relaxed">
            Where caring meets excellence. Your health and comfort are our top priorities in a warm, welcoming environment.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button mat-raised-button color="primary" class="!px-8 sm:!px-12 !py-3 sm:!py-4 !text-base sm:!text-lg !bg-blue-600 hover:!bg-blue-700 transition-all duration-300 transform hover:scale-105">
              <mat-icon class="mr-2">event_available</mat-icon>
              Schedule Your Visit
            </button>
            <button mat-stroked-button class="!px-8 sm:!px-12 !py-3 sm:!py-4 !text-base sm:!text-lg !border-blue-600 !text-blue-600 hover:!bg-blue-50 transition-all duration-300 transform hover:scale-105">
              <mat-icon class="mr-2">favorite</mat-icon>
              Learn About Our Care
            </button>
          </div>
        </div>
        
        <!-- Scroll indicator -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <mat-icon class="text-blue-600 text-3xl">keyboard_arrow_down</mat-icon>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 sm:py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="text-center mb-12 sm:mb-16">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4">Why Families Choose Us</h2>
            <p class="text-lg sm:text-xl text-blue-700 max-w-3xl mx-auto">
              We believe in treating every patient like family, with compassion and the latest medical care
            </p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div *ngFor="let feature of features" class="bg-blue-50 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
              <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-200 flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <mat-icon class="!w-7 !h-7 sm:!w-8 sm:!h-8 text-blue-700">{{feature.icon}}</mat-icon>
              </div>
              <h3 class="text-lg sm:text-xl font-semibold text-blue-900 mb-2 sm:mb-3 text-center">{{feature.title}}</h3>
              <p class="text-blue-700 text-center leading-relaxed text-sm sm:text-base">{{feature.description}}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Departments Section -->
      <section class="py-16 sm:py-20 bg-blue-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="text-center mb-12 sm:mb-16">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4">Our Caring Departments</h2>
            <p class="text-lg sm:text-xl text-blue-700 max-w-3xl mx-auto">
              Specialized care with a personal touch across every medical discipline
            </p>
          </div>
          
          <!-- Loading skeleton -->
          <div *ngIf="departmentsLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div *ngFor="let item of [1,2,3,4,5,6]" class="bg-blue-100 rounded-2xl h-64 sm:h-80 animate-pulse"></div>
          </div>
          
          <!-- Error state -->
          <div *ngIf="departmentsError" class="text-center py-12 sm:py-16">
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <mat-icon class="!w-10 !h-10 sm:!w-12 sm:!h-12 text-blue-600">error_outline</mat-icon>
            </div>
            <h3 class="text-xl sm:text-2xl font-semibold text-blue-900 mb-3 sm:mb-4">We're having trouble loading departments</h3>
            <p class="text-blue-700 mb-6 sm:mb-8 max-w-md mx-auto">Please try again or give us a call for assistance.</p>
            <button mat-raised-button color="primary" (click)="retryLoadDepartments()" class="!px-6 sm:!px-8 !py-2 sm:!py-3 !bg-blue-600">
              <mat-icon class="mr-2">refresh</mat-icon>
              Try Again
            </button>
          </div>
          
          <!-- Actual content -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" *ngIf="departments$ | async as departments">
            <div 
              *ngFor="let dept of getSafeSlice(departments, 6)"
              class="group cursor-pointer">
              <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 h-full flex flex-col">
                <div class="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <mat-icon class="!w-14 !h-14 sm:!w-16 sm:!h-16 text-blue-600">medical_services</mat-icon>
                </div>
                <div class="p-5 sm:p-6 flex-1 flex flex-col">
                  <h3 class="text-lg sm:text-xl font-semibold text-blue-900 mb-2">{{ dept.name }}</h3>
                  <p class="text-blue-700 text-sm sm:text-base mb-4 line-clamp-2 flex-1">{{ dept.description }}</p>
                  <div class="flex items-center justify-between mt-auto">
                    <div class="flex items-center text-xs sm:text-sm text-blue-600">
                      <mat-icon class="!w-4 !h-4 mr-1">phone</mat-icon>
                      {{ dept.phone }}
                    </div>
                    <button mat-button color="primary" (click)="navigateToDepartment(dept.id)" class="group-hover:!bg-blue-50 !text-blue-600">
                      Learn more
                      <mat-icon class="ml-1">arrow_forward</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-10 sm:mt-12">
            <button mat-raised-button color="primary" (click)="navigateToDepartments()" class="!px-8 sm:!px-12 !py-3 sm:!py-4 !text-base sm:!text-lg !bg-blue-600">
              View All Departments
            </button>
          </div>
        </div>
      </section>

      <!-- Doctors Section -->
      <section class="py-16 sm:py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="text-center mb-12 sm:mb-16">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4">Meet Our Caring Team</h2>
            <p class="text-lg sm:text-xl text-blue-700 max-w-3xl mx-auto">
              Dedicated healthcare professionals who treat you like family
            </p>
          </div>
          
          <!-- Loading skeleton -->
          <div *ngIf="doctorsLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div *ngFor="let item of [1,2,3,4,5,6]" class="bg-blue-50 rounded-2xl p-5 sm:p-6 animate-pulse">
              <div class="w-20 h-20 sm:w-24 sm:h-24 bg-blue-200 rounded-full mx-auto mb-3 sm:mb-4"></div>
              <div class="space-y-2">
                <div class="h-5 sm:h-6 bg-blue-200 rounded"></div>
                <div class="h-3 sm:h-4 bg-blue-200 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          </div>
          
          <!-- Error state -->
          <div *ngIf="doctorsError" class="text-center py-12 sm:py-16">
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <mat-icon class="!w-10 !h-10 sm:!w-12 sm:!h-12 text-blue-600">error_outline</mat-icon>
            </div>
            <h3 class="text-xl sm:text-2xl font-semibold text-blue-900 mb-3 sm:mb-4">We're having trouble loading our team</h3>
            <p class="text-blue-700 mb-6 sm:mb-8 max-w-md mx-auto">Please try again or give us a call for assistance.</p>
            <button mat-raised-button color="primary" (click)="retryLoadDoctors()" class="!px-6 sm:!px-8 !py-2 sm:!py-3 !bg-blue-600">
              <mat-icon class="mr-2">refresh</mat-icon>
              Try Again
            </button>
          </div>
          
          <!-- Actual content -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" *ngIf="doctors$ | async as doctors">
            <div 
              *ngFor="let doctor of getSafeSlice(doctors, 6)"
              class="group cursor-pointer">
              <div class="bg-blue-50 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 text-center h-full">
                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-200 mb-4 sm:mb-6 mx-auto flex items-center justify-center overflow-hidden">
                  @if (doctor.imageUrl) {
                    <img 
                      [ngSrc]="doctor.imageUrl" 
                      [alt]="'Photo of ' + doctor.firstName + ' ' + doctor.lastName"
                      width="96"
                      height="96"
                      class="w-full h-full object-cover"
                      priority>
                  } @else {
                    <span class="text-2xl sm:text-3xl font-bold text-blue-700">
                      {{ doctor.firstName.charAt(0) }}{{ doctor.lastName.charAt(0) }}
                    </span>
                  }
                </div>
                
                <h3 class="text-lg sm:text-xl font-semibold text-blue-900 mb-1">
                  Dr. {{ doctor.firstName }} {{ doctor.lastName }}
                </h3>
                <p class="text-blue-600 font-medium mb-2 text-sm sm:text-base">{{ doctor.specialization }}</p>
                <p class="text-blue-700 text-xs sm:text-sm mb-3 sm:mb-4">{{ doctor.department }}</p>
                
                <div class="flex flex-wrap justify-center gap-1 sm:gap-2">
                  <span class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                    {{ doctor.experience }} years experience
                  </span>
                  <span class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <mat-icon class="!w-3 !h-3 mr-1">star</mat-icon>
                    {{ doctor.rating || '4.9' }}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-10 sm:mt-12">
            <button mat-raised-button color="primary" (click)="navigateToDoctors()" class="!px-8 sm:!px-12 !py-3 sm:!py-4 !text-base sm:!text-lg !bg-blue-600">
              Meet Our Full Team
            </button>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="py-16 sm:py-20 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="text-center mb-12 sm:mb-16">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Our Caring Impact</h2>
            <p class="text-lg sm:text-xl text-blue-800 max-w-3xl mx-auto">
              Trusted by families for compassionate healthcare and exceptional outcomes
            </p>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            <div class="text-center">
              <div class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 text-blue-700">
                <div [countUp]="25000" [options]="{duration: 2}">0</div>
              </div>
              <div class="text-base sm:text-lg md:text-xl text-blue-800">Families Cared For</div>
            </div>
            <div class="text-center">
              <div class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 text-blue-700">
                <div [countUp]="150" [options]="{duration: 2}">0</div>
              </div>
              <div class="text-base sm:text-lg md:text-xl text-blue-800">Caring Doctors</div>
            </div>
            <div class="text-center">
              <div class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 text-blue-700">
                <div [countUp]="32" [options]="{duration: 2}">0</div>
              </div>
              <div class="text-base sm:text-lg md:text-xl text-blue-800">Specialized Departments</div>
            </div>
            <div class="text-center">
              <div class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 text-blue-700">
                <div [countUp]="98" [options]="{duration: 2, suffix: '%'}">0</div>
              </div>
              <div class="text-base sm:text-lg md:text-xl text-blue-800">Patient Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <!-- AI Assistant Section -->
      <section class="py-16 sm:py-20 bg-blue-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="grid lg:grid-cols-2 gap-10 sm:gap-12 md:gap-16 items-center">
            <div class="text-center lg:text-left">
              <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4 sm:mb-6">24/7 Caring Assistant</h2>
              <p class="text-lg sm:text-xl text-blue-700 mb-6 sm:mb-8 leading-relaxed">
                Get caring answers to your health questions anytime, day or night. Our AI assistant is here to help guide you with compassion and understanding.
              </p>
              <div class="flex justify-center lg:justify-start">
                <button mat-raised-button color="primary" (click)="navigateToAI()" class="!px-6 sm:!px-8 !py-3 sm:!py-4 !text-base sm:!text-lg !bg-blue-600">
                  <mat-icon class="mr-2">favorite</mat-icon>
                  Start Caring Chat
                </button>
              </div>
            </div>
            
            <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-lg border border-blue-100">
              <div class="bg-blue-50 rounded-2xl p-5 sm:p-6 h-80 flex flex-col">
                <div class="flex items-center gap-3 mb-4 sm:mb-6">
                  <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <mat-icon class="!w-5 !h-5 sm:!w-6 sm:!h-6 text-blue-700">favorite</mat-icon>
                  </div>
                  <div>
                    <div class="font-semibold text-blue-900 text-sm sm:text-base">Caring Assistant</div>
                    <div class="text-xs sm:text-sm text-blue-600">Here to help • 24/7 Available</div>
                  </div>
                </div>
                
                <div class="flex-1 space-y-3 sm:space-y-4 text-xs sm:text-sm text-blue-800">
                  <div class="bg-blue-100 rounded-2xl p-3 sm:p-4">
                    <p>Hello! I'm here to help you with any health questions you might have. How can I assist you today?</p>
                  </div>
                  <div class="bg-blue-100 rounded-2xl p-3 sm:p-4">
                    <p class="mb-1 sm:mb-2">I can help you with:</p>
                    <ul class="space-y-1 text-blue-700">
                      <li>• Understanding your symptoms</li>
                      <li>• Scheduling appointments</li>
                      <li>• Medication information</li>
                      <li>• General health guidance</li>
                    </ul>
                  </div>
                </div>
                
                <div class="mt-3 sm:mt-4 flex gap-2 sm:gap-3">
                  <mat-form-field class="flex-1" appearance="outline">
                    <input matInput 
                           [(ngModel)]="aiMessage" 
                           placeholder="Ask me anything about your health..." 
                           (keyup.enter)="sendAIMessage()"
                           class="!text-blue-900 !text-sm sm:!text-base"
                           aria-label="Type your health question">
                  </mat-form-field>
                  <button mat-icon-button color="primary" (click)="sendAIMessage()" [disabled]="!aiMessage.trim()" class="!bg-blue-600 !text-white !w-10 !h-10">
                    <mat-icon>send</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="py-16 sm:py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="text-center mb-12 sm:mb-16">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4">We're Here for You</h2>
            <p class="text-lg sm:text-xl text-blue-700 max-w-3xl mx-auto">
              Ready to experience caring healthcare? We're here to welcome you and your family with open arms.
            </p>
          </div>
          
          <div class="grid lg:grid-cols-2 gap-10 sm:gap-12 md:gap-16">
            <div class="space-y-6 sm:space-y-8">
              <div *ngIf="hospitalInfo$ | async as hospitalInfo" class="space-y-6 sm:space-y-8">
                <div class="flex items-start gap-4 sm:gap-6">
                  <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-200 flex items-center justify-center flex-shrink-0">
                    <mat-icon class="!w-6 !h-6 sm:!w-8 sm:!h-8 text-blue-700">phone</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-xl sm:text-2xl font-semibold text-blue-900 mb-1 sm:mb-2">Call Us</h3>
                    <p class="text-lg sm:text-xl text-blue-700 mb-1">{{ hospitalInfo.phone }}</p>
                    <p class="text-blue-600 text-sm sm:text-base">24/7 Emergency: {{ hospitalInfo.emergencyPhone || hospitalInfo.emergencyContact }}</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-4 sm:gap-6">
                  <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-200 flex items-center justify-center flex-shrink-0">
                    <mat-icon class="!w-6 !h-6 sm:!w-8 sm:!h-8 text-blue-700">email</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-xl sm:text-2xl font-semibold text-blue-900 mb-1 sm:mb-2">Email Us</h3>
                    <p class="text-lg sm:text-xl text-blue-700 mb-1">{{ hospitalInfo.email }}</p>
                    <p class="text-blue-600 text-sm sm:text-base">We'll respond within 24 hours</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-4 sm:gap-6">
                  <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-200 flex items-center justify-center flex-shrink-0">
                    <mat-icon class="!w-6 !h-6 sm:!w-8 sm:!h-8 text-blue-700">location_on</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-xl sm:text-2xl font-semibold text-blue-900 mb-1 sm:mb-2">Visit Us</h3>
                    <p class="text-lg sm:text-xl text-blue-700 mb-1">{{ hospitalInfo.address }}</p>
                    <p class="text-blue-600 text-sm sm:text-base">Open 24/7 for emergencies</p>
                  </div>
                </div>
              </div>
              
              <div class="pt-6 sm:pt-8">
                <h3 class="text-xl sm:text-2xl font-semibold text-blue-900 mb-4 sm:mb-6">Stay Connected</h3>
                <div class="flex gap-3 sm:gap-4 justify-center lg:justify-start">
                  <a href="#" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors" aria-label="Follow us on Facebook">
                    <mat-icon class="text-blue-700">facebook</mat-icon>
                  </a>
                  <a href="#" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors" aria-label="Follow us on Twitter">
                    <mat-icon class="text-blue-700">twitter</mat-icon>
                  </a>
                  <a href="#" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors" aria-label="Follow us on Instagram">
                    <mat-icon class="text-blue-700">instagram</mat-icon>
                  </a>
                  <a href="#" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors" aria-label="Follow us on LinkedIn">
                    <mat-icon class="text-blue-700">linkedin</mat-icon>
                  </a>
                </div>
              </div>
            </div>
            
            <div class="bg-blue-50 rounded-3xl p-6 sm:p-8 shadow-lg border border-blue-100">
              <div class="h-80 sm:h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                <div class="text-center p-4 sm:p-6">
                  <mat-icon class="!w-16 !h-16 sm:!w-20 sm:!h-20 text-blue-600 mb-4 sm:mb-6">location_on</mat-icon>
                  <h3 class="text-xl sm:text-2xl font-semibold text-blue-900 mb-3 sm:mb-4">Find Our Caring Home</h3>
                  <p class="text-blue-700 mb-4 sm:mb-6 text-sm sm:text-base">Get directions to our welcoming medical facility</p>
                  <button mat-raised-button color="primary" (click)="openMap()" class="!px-6 sm:!px-8 !py-2 sm:!py-3 !bg-blue-600">
                    <mat-icon class="mr-2">open_in_new</mat-icon>
                    Open in Maps
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class PublicInfoComponent implements OnInit {
  private publicService = inject(PublicService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  
  hospitalInfo$: Observable<HospitalInfo | null> = this.publicService.getHospitalInfo().pipe(
    catchError(error => {
      console.error('Error loading hospital info:', error);
      this.snackBar.open('Failed to load hospital information', 'Close', { duration: 3000 });
      return of(null);
    })
  );
  
  departments$: Observable<Department[]> = this.publicService.getDepartments().pipe(
    catchError(error => {
      console.error('Error loading departments:', error);
      this.departmentsError = true;
      this.snackBar.open('Failed to load departments', 'Close', { duration: 3000 });
      return of([]);
    }),
    finalize(() => {
      setTimeout(() => {
        this.departmentsLoading = false;
      });
    })
  );
  
  doctors$: Observable<Doctor[]> = this.publicService.getDoctors().pipe(
    catchError(error => {
      console.error('Error loading doctors:', error);
      this.doctorsError = true;
      this.snackBar.open('Failed to load doctors', 'Close', { duration: 3000 });
      return of([]);
    }),
    finalize(() => {
      setTimeout(() => {
        this.doctorsLoading = false;
      });
    })
  );

  // Loading and error states
  departmentsLoading = true;
  departmentsError = false;
  doctorsLoading = true;
  doctorsError = false;

  // AI chat
  aiMessage = '';

  features = [
    {
      icon: 'favorite',
      title: 'Family-Centered Care',
      description: 'We treat every patient like family with compassion and personalized attention'
    },
    {
      icon: 'groups',
      title: 'Experienced Team',
      description: 'Caring healthcare professionals with years of experience in family medicine'
    },
    {
      icon: 'home',
      title: 'Comfortable Environment',
      description: 'A warm, welcoming space designed for your comfort and peace of mind'
    },
    {
      icon: 'accessibility',
      title: 'Easy Access',
      description: 'Convenient scheduling and accessible care when you need it most'
    }
  ];

  ngOnInit(): void {}

  getSafeSlice(array: any[] | null | undefined, size: number): any[] {
    return array?.slice(0, size) || [];
  }

  // Navigation methods
  navigateToAppointment(): void {
    this.router.navigate(['/appointment']);
  }

  navigateToDepartments(): void {
    this.router.navigate(['/departments']);
  }

  navigateToDoctors(): void {
    this.router.navigate(['/doctors']);
  }

  navigateToDepartment(deptId: string): void {
    this.router.navigate(['/departments', deptId]);
  }

  navigateToAI(): void {
    this.router.navigate(['/ai-symptom']);
  }

  // Utility methods
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  retryLoadDepartments(): void {
    this.departmentsError = false;
    this.departmentsLoading = true;
    this.departments$ = this.publicService.getDepartments().pipe(
      catchError(error => {
        console.error('Error loading departments:', error);
        this.departmentsError = true;
        this.snackBar.open('Failed to load departments', 'Close', { duration: 3000 });
        return of([]);
      }),
      finalize(() => {
        setTimeout(() => {
          this.departmentsLoading = false;
        });
      })
    );
  }

  retryLoadDoctors(): void {
    this.doctorsError = false;
    this.doctorsLoading = true;
    this.doctors$ = this.publicService.getDoctors().pipe(
      catchError(error => {
        console.error('Error loading doctors:', error);
        this.doctorsError = true;
        this.snackBar.open('Failed to load doctors', 'Close', { duration: 3000 });
        return of([]);
      }),
      finalize(() => {
        setTimeout(() => {
          this.doctorsLoading = false;
        });
      })
    );
  }

  sendAIMessage(): void {
    if (this.aiMessage.trim()) {
      // In a real app, this would send the message to the AI service
      this.snackBar.open('AI feature coming soon!', 'Close', { duration: 2000 });
      this.aiMessage = '';
    }
  }

  openMap(): void {
    // In a real app, this would open Google Maps with the hospital location
    const hospitalAddress = encodeURIComponent('123 Healthcare Avenue, Medical District, City');
    window.open(`https://www.google.com/maps/search/?api=1&query=${hospitalAddress}`, '_blank');
  }
}