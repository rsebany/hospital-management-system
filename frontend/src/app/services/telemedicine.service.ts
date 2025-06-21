import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface TelemedicineSession {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  reason: string;
  vitalData?: any;
  notes?: string;
}

export interface DoctorNotification {
  id: string;
  doctorId: string;
  patientId: string;
  type: 'emergency' | 'consultation' | 'follow_up' | 'alert';
  message: string;
  timestamp: string;
  vitalData?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'acknowledged';
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

@Injectable({ providedIn: 'root' })
export class TelemedicineService {
  private baseUrl = 'http://localhost:3000/api/v1';
  private activeSessionSubject = new BehaviorSubject<TelemedicineSession | null>(null);
  private notificationsSubject = new BehaviorSubject<DoctorNotification[]>([]);

  public activeSession$ = this.activeSessionSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Send emergency alert to doctors
  sendEmergencyAlert(alert: any): Observable<any> {
    const payload = {
      type: 'emergency',
      message: alert.message,
      vitalData: alert.vitalData,
      timestamp: alert.timestamp,
      priority: 'critical',
      recommendedAction: alert.recommendedAction
    };

    return this.http.post(`${this.baseUrl}/patients/notifications`, payload);
  }

  // Get available doctors for emergency
  getAvailableDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/doctors/available`);
  }

  // Request emergency consultation
  requestEmergencyConsultation(doctorId: string, reason: string, vitalData?: any): Observable<TelemedicineSession> {
    const payload = {
      doctorId,
      reason,
      vitalData,
      priority: 'critical'
    };

    return this.http.post<TelemedicineSession>(`${this.baseUrl}/doctors/telemedicine/emergency`, payload);
  }

  // Start telemedicine session
  startSession(sessionId: string): Observable<TelemedicineSession> {
    return this.http.post<TelemedicineSession>(`${this.baseUrl}/doctors/telemedicine/${sessionId}/start`, {});
  }

  // End telemedicine session
  endSession(sessionId: string, notes?: string): Observable<TelemedicineSession> {
    const payload = { notes };
    return this.http.post<TelemedicineSession>(`${this.baseUrl}/doctors/telemedicine/${sessionId}/end`, payload);
  }

  // Get active telemedicine sessions
  getActiveSessions(): Observable<TelemedicineSession[]> {
    return this.http.get<TelemedicineSession[]>(`${this.baseUrl}/doctors/telemedicine/active`);
  }

  // Get session history
  getSessionHistory(patientId?: string): Observable<TelemedicineSession[]> {
    const params: any = {};
    if (patientId) {
      params.patientId = patientId;
    }
    return this.http.get<TelemedicineSession[]>(`${this.baseUrl}/doctors/telemedicine/history`, { params });
  }

  // Get doctor notifications
  getDoctorNotifications(doctorId: string): Observable<DoctorNotification[]> {
    return this.http.get<DoctorNotification[]>(`${this.baseUrl}/doctors/${doctorId}/notifications`);
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/doctors/notifications/${notificationId}/read`, {});
  }

  // Acknowledge notification
  acknowledgeNotification(notificationId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/doctors/notifications/${notificationId}/acknowledge`, {});
  }

  // Get emergency contacts
  getEmergencyContacts(patientId: string): Observable<EmergencyContact[]> {
    return this.http.get<EmergencyContact[]>(`${this.baseUrl}/patients/${patientId}/emergency-contacts`);
  }

  // Add emergency contact
  addEmergencyContact(patientId: string, contact: Omit<EmergencyContact, 'id'>): Observable<EmergencyContact> {
    return this.http.post<EmergencyContact>(`${this.baseUrl}/patients/${patientId}/emergency-contacts`, contact);
  }

  // Update emergency contact
  updateEmergencyContact(contactId: string, contact: Partial<EmergencyContact>): Observable<EmergencyContact> {
    return this.http.put<EmergencyContact>(`${this.baseUrl}/emergency-contacts/${contactId}`, contact);
  }

  // Delete emergency contact
  deleteEmergencyContact(contactId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/emergency-contacts/${contactId}`);
  }

  // Send SMS alert to emergency contacts
  sendEmergencySMS(patientId: string, message: string): Observable<any> {
    const payload = { patientId, message };
    return this.http.post(`${this.baseUrl}/emergency/sms`, payload);
  }

  // Get telemedicine statistics
  getTelemedicineStats(doctorId?: string): Observable<any> {
    const params: any = {};
    if (doctorId) {
      params.doctorId = doctorId;
    }
    return this.http.get(`${this.baseUrl}/doctors/telemedicine/stats`, { params });
  }

  // Set active session
  setActiveSession(session: TelemedicineSession | null): void {
    this.activeSessionSubject.next(session);
  }

  // Get current active session
  getActiveSession(): TelemedicineSession | null {
    return this.activeSessionSubject.value;
  }

  // Update notifications
  updateNotifications(notifications: DoctorNotification[]): void {
    this.notificationsSubject.next(notifications);
  }

  // Clear notifications
  clearNotifications(): void {
    this.notificationsSubject.next([]);
  }
} 