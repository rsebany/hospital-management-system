import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WearableData {
  timestamp: string;
  heartRate?: number;
  steps?: number;
  // Add more fields as needed
}

@Injectable({ providedIn: 'root' })
export class WearableService {
  private baseUrl = 'http://localhost:3000/api/v1/wearables';

  constructor(private http: HttpClient) {}

  getPatientData(patientId: string): Observable<WearableData[]> {
    return this.http.get<WearableData[]>(`${this.baseUrl}/${patientId}`);
  }
} 