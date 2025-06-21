import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { PublicService, HospitalInfo, Doctor, Department, ContactForm } from '../services/public.service';
import { Observable, catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-public-info',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule
  ],
  template: `
    <div style="background-color: #F1F5F9; min-height: 100vh;">
      <!-- Hero Section -->
      <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); color: white; padding: 60px 20px; text-align: center;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h1 style="font-size: 3.5rem; font-weight: bold; margin-bottom: 20px;">
            Welcome to Hopitaliko
          </h1>
          <p style="font-size: 1.3rem; margin-bottom: 30px; color: #E0F2FE;">
            Providing exceptional healthcare services with compassion and excellence
          </p>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button 
              mat-raised-button 
              style="background-color: #F97316; color: white; padding: 12px 24px; font-size: 1.1rem;"
              (click)="scrollToSection('services')"
            >
              Our Services
            </button>
            <button 
              mat-stroked-button 
              style="border-color: white; color: white; padding: 12px 24px; font-size: 1.1rem;"
              (click)="scrollToSection('contact')"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
        <!-- Hospital Information -->
        <div id="info" style="margin-bottom: 60px;">
          <div *ngIf="hospitalInfo$ | async as hospitalInfo">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="color: #0891B2; font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
                About Our Hospital
              </h2>
              <p style="color: #666; font-size: 1.2rem;">{{hospitalInfo.description}}</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px;">
              <!-- Contact Information -->
              <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <mat-card-header style="padding: 20px 20px 0;">
                  <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
                    Contact Information
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <mat-icon style="color: #0891B2; margin-right: 15px;">location_on</mat-icon>
                    <div>
                      <div style="color: #333; font-weight: 600;">Address</div>
                      <div style="color: #666;">{{hospitalInfo.address}}</div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <mat-icon style="color: #0891B2; margin-right: 15px;">phone</mat-icon>
                    <div>
                      <div style="color: #333; font-weight: 600;">Phone</div>
                      <div style="color: #666;">{{hospitalInfo.phone}}</div>
                    </div>
                  </div>
                  <div *ngIf="hospitalInfo.email" style="display: flex; align-items: center; margin-bottom: 15px;">
                    <mat-icon style="color: #0891B2; margin-right: 15px;">email</mat-icon>
                    <div>
                      <div style="color: #333; font-weight: 600;">Email</div>
                      <div style="color: #666;">{{hospitalInfo.email}}</div>
                    </div>
                  </div>
                  <div *ngIf="hospitalInfo.website" style="display: flex; align-items: center;">
                    <mat-icon style="color: #0891B2; margin-right: 15px;">language</mat-icon>
                    <div>
                      <div style="color: #333; font-weight: 600;">Website</div>
                      <a [href]="hospitalInfo.website" target="_blank" style="color: #0891B2; text-decoration: none;">{{hospitalInfo.website}}</a>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Visiting Hours -->
              <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <mat-card-header style="padding: 20px 20px 0;">
                  <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
                    Visiting Hours
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <mat-icon style="color: #0891B2; margin-right: 15px;">schedule</mat-icon>
                    <div>
                      <div style="color: #333; font-weight: 600;">General Visiting</div>
                      <div style="color: #666;">{{hospitalInfo.visitingHours}}</div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center;">
                    <mat-icon style="color: #DC2626; margin-right: 15px;">warning</mat-icon>
                    <div>
                      <div style="color: #333; font-weight: 600;">Emergency</div>
                      <div style="color: #666;">24/7 Available</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Facilities -->
              <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <mat-card-header style="padding: 20px 20px 0;">
                  <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
                    Our Facilities
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <div *ngIf="hospitalInfo.facilities && hospitalInfo.facilities.length > 0">
                    <div 
                      *ngFor="let facility of hospitalInfo.facilities" 
                      style="display: flex; align-items: center; margin-bottom: 10px;"
                    >
                      <mat-icon style="color: #059669; margin-right: 10px; font-size: 20px;">check_circle</mat-icon>
                      <span style="color: #666;">{{facility}}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>

        <!-- Departments Section -->
        <div id="departments" style="margin-bottom: 60px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="color: #0891B2; font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
              Our Departments
            </h2>
            <p style="color: #666; font-size: 1.2rem;">Specialized care across various medical disciplines</p>
          </div>

          <div *ngIf="departments$ | async as departments">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
              <mat-card 
                *ngFor="let dept of departments" 
                style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.2s;"
                (mouseenter)="onCardHover($event)"
                (mouseleave)="onCardLeave($event)"
              >
                <mat-card-header style="padding: 20px 20px 0;">
                  <mat-card-title style="color: #0891B2; font-size: 1.4rem; font-weight: 600;">
                    {{dept.name}}
                  </mat-card-title>
                  <mat-card-subtitle *ngIf="dept.headDoctor" style="color: #666;">
                    Head: {{dept.headDoctor}}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">{{dept.description}}</p>
                  <div *ngIf="dept.location" style="margin-bottom: 10px;">
                    <div style="color: #333; font-weight: 600; font-size: 0.9rem;">Location</div>
                    <div style="color: #666; font-size: 0.9rem;">{{dept.location}}</div>
                  </div>
                  <div *ngIf="dept.services && dept.services.length > 0">
                    <div style="color: #333; font-weight: 600; font-size: 0.9rem; margin-bottom: 8px;">Services</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                      <span 
                        *ngFor="let service of dept.services"
                        style="background-color: #E0F2FE; color: #0891B2; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem;"
                      >
                        {{service}}
                      </span>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions style="padding: 0 20px 20px;">
                  <button 
                    mat-raised-button 
                    style="background-color: #0891B2; color: white; width: 100%;"
                    (click)="viewDepartment(dept)"
                  >
                    Learn More
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </div>

        <!-- Doctors Section -->
        <div id="doctors" style="margin-bottom: 60px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="color: #0891B2; font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
              Our Medical Team
            </h2>
            <p style="color: #666; font-size: 1.2rem;">Experienced healthcare professionals dedicated to your well-being</p>
          </div>

          <div *ngIf="doctors$ | async as doctors">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
              <mat-card 
                *ngFor="let doctor of doctors" 
                style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; transition: transform 0.2s;"
                (mouseenter)="onCardHover($event)"
                (mouseleave)="onCardLeave($event)"
              >
                <mat-card-header style="padding: 20px 20px 0;">
                  <img 
                    *ngIf="doctor.imageUrl" 
                    [src]="doctor.imageUrl" 
                    [alt]="doctor.firstName + ' ' + doctor.lastName"
                    style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 0 auto 15px;"
                  />
                  <mat-card-title style="color: #0891B2; font-size: 1.3rem; font-weight: 600;">
                    {{doctor.firstName}} {{doctor.lastName}}
                  </mat-card-title>
                  <mat-card-subtitle style="color: #666; font-size: 1rem;">
                    {{doctor.specialization}}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content style="padding: 20px;">
                  <div *ngIf="doctor.department" style="margin-bottom: 10px;">
                    <div style="color: #333; font-weight: 600; font-size: 0.9rem;">Department</div>
                    <div style="color: #666; font-size: 0.9rem;">{{doctor.department}}</div>
                  </div>
                  <div *ngIf="doctor.experience" style="margin-bottom: 10px;">
                    <div style="color: #333; font-weight: 600; font-size: 0.9rem;">Experience</div>
                    <div style="color: #666; font-size: 0.9rem;">{{doctor.experience}} years</div>
                  </div>
                  <div *ngIf="doctor.availability" style="margin-bottom: 10px;">
                    <div style="color: #333; font-weight: 600; font-size: 0.9rem;">Availability</div>
                    <div style="color: #666; font-size: 0.9rem;">{{doctor.availability}}</div>
                  </div>
                </mat-card-content>
                <mat-card-actions style="padding: 0 20px 20px;">
                  <button 
                    mat-raised-button 
                    style="background-color: #0891B2; color: white; width: 100%;"
                    (click)="viewDoctor(doctor)"
                  >
                    View Profile
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </div>

        <!-- Contact Form Section -->
        <div id="contact" style="margin-bottom: 60px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="color: #0891B2; font-size: 2.5rem; font-weight: bold; margin-bottom: 10px;">
              Contact Us
            </h2>
            <p style="color: #666; font-size: 1.2rem;">Get in touch with us for any questions or concerns</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start;">
            <!-- Contact Form -->
            <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <mat-card-header style="padding: 20px 20px 0;">
                <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
                  Send us a Message
                </mat-card-title>
              </mat-card-header>
              <mat-card-content style="padding: 20px;">
                <form (ngSubmit)="submitContactForm()" #contactForm="ngForm">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <mat-form-field style="width: 100%;">
                      <mat-label>Name</mat-label>
                      <input matInput [(ngModel)]="contactFormData.name" name="name" required>
                    </mat-form-field>
                    <mat-form-field style="width: 100%;">
                      <mat-label>Email</mat-label>
                      <input matInput type="email" [(ngModel)]="contactFormData.email" name="email" required>
                    </mat-form-field>
                  </div>
                  <mat-form-field style="width: 100%; margin-bottom: 15px;">
                    <mat-label>Phone (Optional)</mat-label>
                    <input matInput [(ngModel)]="contactFormData.phone" name="phone">
                  </mat-form-field>
                  <mat-form-field style="width: 100%; margin-bottom: 15px;">
                    <mat-label>Subject</mat-label>
                    <input matInput [(ngModel)]="contactFormData.subject" name="subject" required>
                  </mat-form-field>
                  <mat-form-field style="width: 100%; margin-bottom: 20px;">
                    <mat-label>Message</mat-label>
                    <textarea matInput rows="4" [(ngModel)]="contactFormData.message" name="message" required></textarea>
                  </mat-form-field>
                  <button 
                    type="submit" 
                    mat-raised-button 
                    style="background-color: #0891B2; color: white; width: 100%;"
                    [disabled]="!contactForm.valid || submitting"
                  >
                    <mat-spinner *ngIf="submitting" style="width: 20px; height: 20px; margin-right: 10px;"></mat-spinner>
                    {{submitting ? 'Sending...' : 'Send Message'}}
                  </button>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Contact Information -->
            <mat-card style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <mat-card-header style="padding: 20px 20px 0;">
                <mat-card-title style="color: #0891B2; font-size: 1.5rem; font-weight: 600;">
                  Get in Touch
                </mat-card-title>
              </mat-card-header>
              <mat-card-content style="padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                  <mat-icon style="color: #0891B2; margin-right: 15px; font-size: 24px;">location_on</mat-icon>
                  <div>
                    <div style="color: #333; font-weight: 600;">Visit Us</div>
                    <div style="color: #666;">123 Healthcare Avenue, Medical District, City</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                  <mat-icon style="color: #0891B2; margin-right: 15px; font-size: 24px;">phone</mat-icon>
                  <div>
                    <div style="color: #333; font-weight: 600;">Call Us</div>
                    <div style="color: #666;">(555) 123-4567</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                  <mat-icon style="color: #0891B2; margin-right: 15px; font-size: 24px;">email</mat-icon>
                  <div>
                    <div style="color: #333; font-weight: 600;">Email Us</div>
                    <div style="color: #666;">info&#64;hopitaliko.com</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center;">
                  <mat-icon style="color: #0891B2; margin-right: 15px; font-size: 24px;">schedule</mat-icon>
                  <div>
                    <div style="color: #333; font-weight: 600;">Business Hours</div>
                    <div style="color: #666;">Mon-Fri: 8AM-8PM<br>Sat-Sun: 9AM-6PM</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicInfoComponent implements OnInit {
  private publicService = inject(PublicService);
  private snackBar = inject(MatSnackBar);

  hospitalInfo$: Observable<HospitalInfo> = this.publicService.getHospitalInfo().pipe(
    catchError(error => {
      console.error('Error loading hospital info:', error);
      return of({} as HospitalInfo);
    })
  );

  departments$: Observable<Department[]> = this.publicService.getDepartments().pipe(
    catchError(error => {
      console.error('Error loading departments:', error);
      return of([]);
    })
  );

  doctors$: Observable<Doctor[]> = this.publicService.getDoctors().pipe(
    catchError(error => {
      console.error('Error loading doctors:', error);
      return of([]);
    })
  );

  contactFormData: ContactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  submitting = false;

  ngOnInit(): void {
    // Component initialization
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  viewDepartment(dept: Department): void {
    this.snackBar.open(`Viewing department: ${dept.name}`, 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to department details page
  }

  viewDoctor(doctor: Doctor): void {
    this.snackBar.open(`Viewing doctor: ${doctor.firstName} ${doctor.lastName}`, 'Close', { 
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    // Navigate to doctor profile page
  }

  submitContactForm(): void {
    if (!this.contactFormData.name || !this.contactFormData.email || !this.contactFormData.subject || !this.contactFormData.message) {
      this.snackBar.open('Please fill in all required fields', 'Close', { 
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.submitting = true;
    this.publicService.sendContactForm(this.contactFormData).subscribe({
      next: (response) => {
        this.snackBar.open('Message sent successfully! We will get back to you soon.', 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-success']
        });
        this.contactFormData = {
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        };
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error sending contact form:', error);
        this.snackBar.open('Failed to send message. Please try again.', 'Close', { 
          duration: 5000,
          panelClass: ['snackbar-error']
        });
        this.submitting = false;
      }
    });
  }

  onCardHover(event: any): void {
    event.target.style.transform = 'translateY(-4px)';
    event.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
  }

  onCardLeave(event: any): void {
    event.target.style.transform = 'translateY(0)';
    event.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  }
}