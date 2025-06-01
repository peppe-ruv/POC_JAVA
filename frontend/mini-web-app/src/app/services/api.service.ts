import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HmacVerificationResponse {
  // Define the expected structure of data_payload if known, e.g.:
  // name?: string;
  // message?: string;
  // Or use a generic type
  [key: string]: any; // Allows any properties in data_payload
}

export interface AssistanceRequestData {
  name: string;
  email: string;
  issue_description: string;
}

export interface AssistanceRequestResponse {
  message: string;
  data?: {
    id: number;
    submitted_at: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Base URL for the backend API
  // In a real app, this might come from environment variables
  private apiUrl = '/api'; // Using relative path for proxy

  constructor(private http: HttpClient) { }

  verifyHmac(cNumber: string): Observable<HmacVerificationResponse> {
    return this.http.post<HmacVerificationResponse>(`${this.apiUrl}/verify-hmac`, { c_number: cNumber });
  }

  submitAssistanceRequest(requestData: AssistanceRequestData): Observable<AssistanceRequestResponse> {
    return this.http.post<AssistanceRequestResponse>(`${this.apiUrl}/assistance-request`, requestData);
  }
}
