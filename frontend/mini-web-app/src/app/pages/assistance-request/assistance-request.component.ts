import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { Router, RouterLink } from '@angular/router'; // Import RouterLink
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ApiService, AssistanceRequestData, AssistanceRequestResponse } from '../../services/api.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-assistance-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Add CommonModule, ReactiveFormsModule, RouterLink
  templateUrl: './assistance-request.component.html',
  styleUrls: ['./assistance-request.component.css']
})
export class AssistanceRequestPageComponent {
  assistanceForm: FormGroup;
  isLoading = false;
  submissionError: string | null = null;
  submissionSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.assistanceForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      issue_description: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.assistanceForm.valid) {
      this.isLoading = true;
      this.submissionError = null;
      this.submissionSuccess = null;
      const formData: AssistanceRequestData = this.assistanceForm.value;

      this.apiService.submitAssistanceRequest(formData).pipe(
        tap((response: AssistanceRequestResponse) => {
          this.isLoading = false;
          this.submissionSuccess = response.message || 'Request submitted successfully!';
          this.assistanceForm.reset();
          // Optionally navigate away after a delay or on user action
          // setTimeout(() => this.router.navigate(['/']), 3000);
        }),
        catchError(err => {
          this.isLoading = false;
          this.submissionError = err.error?.error || err.message || 'Failed to submit assistance request.';
          return of(null); // Complete the stream
        })
      ).subscribe();
    } else {
      // Mark fields as touched to show validation errors
      this.assistanceForm.markAllAsTouched();
    }
  }
}
