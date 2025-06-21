import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WearableService, VitalData, EmergencyAlert } from '../../services/wearable.service';
import { TelemedicineService, TelemedicineSession, EmergencyContact } from '../../services/telemedicine.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-emergency-triage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🚨 Emergency Triage & Response System
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Critical health monitoring and emergency response coordination
          </p>
        </div>

        <!-- Emergency Status Dashboard -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">🩺 Emergency Status</h2>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" [ngClass]="hasCriticalAlerts ? 'bg-red-500 animate-pulse' : 'bg-green-500'"></div>
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ hasCriticalAlerts ? 'CRITICAL ALERT' : 'All Systems Normal' }}
                </span>
              </div>
              <button 
                (click)="refreshStatus()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                Refresh Status
              </button>
            </div>
          </div>

          <!-- Critical Alerts Summary -->
          <div *ngIf="criticalAlerts.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold text-red-700 dark:text-red-300 mb-3">🚨 Critical Alerts ({{ criticalAlerts.length }})</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let alert of criticalAlerts.slice(0, 4)" 
                   class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-red-800 dark:text-red-200 mb-1">{{ alert.message }}</h4>
                    <p class="text-sm text-red-700 dark:text-red-300 mb-2">{{ alert.recommendedAction }}</p>
                    <p class="text-xs text-red-600 dark:text-red-400">{{ alert.timestamp | date:'short' }}</p>
                  </div>
                  <span class="text-2xl ml-2">🚨</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Emergency Response Actions -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              (click)="requestEmergencyConsultation()"
              [disabled]="isRequestingConsultation"
              class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
              <span *ngIf="isRequestingConsultation" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
              <span class="text-lg mr-2">👨‍⚕️</span>
              {{ isRequestingConsultation ? 'Requesting...' : 'Request Emergency Consultation' }}
            </button>

            <button 
              (click)="notifyEmergencyContacts()"
              [disabled]="isNotifyingContacts"
              class="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
              <span *ngIf="isNotifyingContacts" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
              <span class="text-lg mr-2">📞</span>
              {{ isNotifyingContacts ? 'Notifying...' : 'Notify Emergency Contacts' }}
            </button>

            <button 
              (click)="callEmergencyServices()"
              class="bg-red-800 hover:bg-red-900 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
              <span class="text-lg mr-2">🚑</span>
              Call Emergency Services
            </button>
          </div>
        </div>

        <!-- Active Telemedicine Session -->
        <div *ngIf="activeSession" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">👨‍⚕️ Active Emergency Consultation</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Session Details</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Status:</span>
                  <span class="font-medium" [ngClass]="getStatusColor(activeSession.status)">
                    {{ activeSession.status | titlecase }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Started:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ activeSession.startTime | date:'short' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Reason:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ activeSession.reason }}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Actions</h3>
              <div class="space-y-3">
                <button 
                  (click)="endSession()"
                  class="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  End Session
                </button>
                <button 
                  (click)="addSessionNotes()"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Add Notes
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Emergency Contacts -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">📞 Emergency Contacts</h2>
            <button 
              (click)="addEmergencyContact()"
              class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Add Contact
            </button>
          </div>

          <div *ngIf="emergencyContacts.length === 0" class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400 mb-4">No emergency contacts configured</p>
            <button 
              (click)="addEmergencyContact()"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Add Your First Contact
            </button>
          </div>

          <div *ngIf="emergencyContacts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let contact of emergencyContacts" 
                 class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ contact.name }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">{{ contact.relationship }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span *ngIf="contact.isPrimary" class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                  <button 
                    (click)="editContact(contact)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    ✏️
                  </button>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center">
                  <span class="text-gray-500 dark:text-gray-400 mr-2">📞</span>
                  <span class="text-gray-900 dark:text-white">{{ contact.phone }}</span>
                </div>
                <div *ngIf="contact.email" class="flex items-center">
                  <span class="text-gray-500 dark:text-gray-400 mr-2">📧</span>
                  <span class="text-gray-900 dark:text-white">{{ contact.email }}</span>
                </div>
              </div>
              <div class="mt-3 flex space-x-2">
                <button 
                  (click)="callContact(contact)"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200">
                  Call
                </button>
                <button 
                  (click)="sendSMSToContact(contact)"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200">
                  SMS
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Alerts History -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">📋 Recent Alerts History</h2>
          
          <div *ngIf="allAlerts.length === 0" class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400">No alerts recorded</p>
          </div>

          <div *ngIf="allAlerts.length > 0" class="space-y-3">
            <div *ngFor="let alert of allAlerts.slice(0, 10)" 
                 class="p-4 rounded-lg border"
                 [ngClass]="alert.type === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                           alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
                           'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{ alert.message }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">{{ alert.recommendedAction }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ alert.timestamp | date:'short' }}</p>
                </div>
                <span class="text-lg ml-2">
                  {{ alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️' }}
                </span>
              </div>
            </div>
          </div>

          <div *ngIf="allAlerts.length > 10" class="mt-4 text-center">
            <button 
              (click)="loadMoreAlerts()"
              class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Load More Alerts
            </button>
          </div>
        </div>

        <!-- Add/Edit Contact Modal -->
        <div *ngIf="showContactModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ editingContact ? 'Edit' : 'Add' }} Emergency Contact
            </h3>
            
            <form (ngSubmit)="saveContact()" #contactForm="ngForm">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newContact.name" 
                    name="name"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Full name"
                    required>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relationship</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newContact.relationship" 
                    name="relationship"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Spouse, Parent, Friend"
                    required>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="newContact.phone" 
                    name="phone"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Phone number"
                    required>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                  <input 
                    type="email" 
                    [(ngModel)]="newContact.email" 
                    name="email"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Email address">
                </div>

                <div class="flex items-center">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="newContact.isPrimary" 
                    name="isPrimary"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                  <label class="ml-2 text-sm text-gray-700 dark:text-gray-300">Set as primary contact</label>
                </div>
              </div>

              <div class="flex space-x-3 mt-6">
                <button 
                  type="button"
                  (click)="cancelContactEdit()"
                  class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Cancel
                </button>
                <button 
                  type="submit"
                  [disabled]="!contactForm.valid"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  {{ editingContact ? 'Update' : 'Add' }} Contact
                </button>
              </div>
            </form>
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
export class EmergencyTriageComponent implements OnInit, OnDestroy {
  criticalAlerts: EmergencyAlert[] = [];
  allAlerts: EmergencyAlert[] = [];
  activeSession: TelemedicineSession | null = null;
  emergencyContacts: EmergencyContact[] = [];
  
  isRequestingConsultation = false;
  isNotifyingContacts = false;
  showContactModal = false;
  editingContact: EmergencyContact | null = null;
  
  newContact: Omit<EmergencyContact, 'id'> = {
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimary: false
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private wearableService: WearableService,
    private telemedicineService: TelemedicineService
  ) {}

  ngOnInit(): void {
    // Subscribe to alerts
    this.subscriptions.push(
      this.wearableService.alerts$.subscribe(alerts => {
        this.allAlerts = alerts;
        this.criticalAlerts = alerts.filter(alert => alert.type === 'critical');
      })
    );

    // Subscribe to active session
    this.subscriptions.push(
      this.telemedicineService.activeSession$.subscribe(session => {
        this.activeSession = session;
      })
    );

    // Load emergency contacts
    this.loadEmergencyContacts();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get hasCriticalAlerts(): boolean {
    return this.criticalAlerts.length > 0;
  }

  refreshStatus(): void {
    // Refresh alerts and session status
    this.criticalAlerts = this.wearableService.getCurrentAlerts().filter(alert => alert.type === 'critical');
  }

  requestEmergencyConsultation(): void {
    this.isRequestingConsultation = true;
    
    // Get available doctors and request consultation
    this.telemedicineService.getAvailableDoctors().subscribe({
      next: (doctors) => {
        if (doctors.length > 0) {
          const doctor = doctors[0]; // Select first available doctor
          const reason = this.criticalAlerts.length > 0 
            ? this.criticalAlerts[0].message 
            : 'Emergency consultation requested';
          
          this.telemedicineService.requestEmergencyConsultation(doctor.id, reason).subscribe({
            next: (session) => {
              this.telemedicineService.setActiveSession(session);
              this.isRequestingConsultation = false;
            },
            error: (error) => {
              console.error('Error requesting consultation:', error);
              this.isRequestingConsultation = false;
            }
          });
        } else {
          console.log('No available doctors');
          this.isRequestingConsultation = false;
        }
      },
      error: (error) => {
        console.error('Error getting available doctors:', error);
        this.isRequestingConsultation = false;
      }
    });
  }

  notifyEmergencyContacts(): void {
    this.isNotifyingContacts = true;
    
    const message = this.criticalAlerts.length > 0 
      ? `EMERGENCY: ${this.criticalAlerts[0].message}` 
      : 'Emergency situation detected. Please contact immediately.';
    
    this.telemedicineService.sendEmergencySMS('patient-123', message).subscribe({
      next: () => {
        console.log('Emergency SMS sent');
        this.isNotifyingContacts = false;
      },
      error: (error) => {
        console.error('Error sending emergency SMS:', error);
        this.isNotifyingContacts = false;
      }
    });
  }

  callEmergencyServices(): void {
    // In a real app, this would integrate with emergency services
    window.open('tel:911', '_self');
  }

  endSession(): void {
    if (this.activeSession) {
      this.telemedicineService.endSession(this.activeSession.id).subscribe({
        next: (session) => {
          this.telemedicineService.setActiveSession(null);
        },
        error: (error) => {
          console.error('Error ending session:', error);
        }
      });
    }
  }

  addSessionNotes(): void {
    // Implementation for adding session notes
    console.log('Add session notes functionality');
  }

  loadEmergencyContacts(): void {
    this.telemedicineService.getEmergencyContacts('patient-123').subscribe({
      next: (contacts) => {
        this.emergencyContacts = contacts;
      },
      error: (error) => {
        console.error('Error loading emergency contacts:', error);
      }
    });
  }

  addEmergencyContact(): void {
    this.editingContact = null;
    this.newContact = {
      name: '',
      relationship: '',
      phone: '',
      email: '',
      isPrimary: false
    };
    this.showContactModal = true;
  }

  editContact(contact: EmergencyContact): void {
    this.editingContact = contact;
    this.newContact = { ...contact };
    this.showContactModal = true;
  }

  saveContact(): void {
    if (this.editingContact) {
      this.telemedicineService.updateEmergencyContact(this.editingContact.id, this.newContact).subscribe({
        next: (contact) => {
          this.loadEmergencyContacts();
          this.showContactModal = false;
        },
        error: (error) => {
          console.error('Error updating contact:', error);
        }
      });
    } else {
      this.telemedicineService.addEmergencyContact('patient-123', this.newContact).subscribe({
        next: (contact) => {
          this.loadEmergencyContacts();
          this.showContactModal = false;
        },
        error: (error) => {
          console.error('Error adding contact:', error);
        }
      });
    }
  }

  cancelContactEdit(): void {
    this.showContactModal = false;
    this.editingContact = null;
  }

  callContact(contact: EmergencyContact): void {
    window.open(`tel:${contact.phone}`, '_self');
  }

  sendSMSToContact(contact: EmergencyContact): void {
    const message = 'Emergency situation detected. Please contact immediately.';
    window.open(`sms:${contact.phone}?body=${encodeURIComponent(message)}`, '_self');
  }

  loadMoreAlerts(): void {
    // Implementation for loading more alerts
    console.log('Load more alerts functionality');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'completed': return 'text-blue-600 dark:text-blue-400';
      case 'cancelled': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  }
} 