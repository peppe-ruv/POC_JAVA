import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router'; // Import RouterLink
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf, *ngFor, etc.
import { ApiService, HmacVerificationResponse } from '../../services/api.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add CommonModule and RouterLink
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoading = false;
  apiData: HmacVerificationResponse | null = null;
  error: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const cNumber = params.get('c_number');
      if (cNumber) {
        this.isLoading = true;
        this.error = null;
        this.apiService.verifyHmac(cNumber).pipe(
          tap(response => {
            this.isLoading = false;
            this.apiData = response;
            // Check if the response is an error object like { error: "message" }
            // The ApiService currently expects HmacVerificationResponse directly for success
            // and relies on HttpClient's error handling for HTTP errors.
            // If the backend returns a 200 OK with an error payload, that needs specific handling.
            // For now, we assume a successful response means data_payload is directly the response.
            if (response && typeof response === 'object' && 'error' in response) {
                this.error = (response as any).error; // Casting to any to access error property
                this.apiData = null; // Clear data if it's an error structure
            }

          }),
          catchError(err => {
            this.isLoading = false;
            // err.error might contain the actual error message from the backend
            this.error = err.error?.error || err.message || 'An unknown error occurred.';
            this.apiData = null;
            return of(null); // Return a null observable to complete the stream
          })
        ).subscribe();
      } else {
        // No c_number, maybe show a default state or instructions
        this.error = 'No c_number provided in URL. Please use a valid link.';
      }
    });
  }

  // Helper to get keys from apiData for iteration in the template
  get dataKeys(): string[] {
    return this.apiData ? Object.keys(this.apiData) : [];
  }
}
