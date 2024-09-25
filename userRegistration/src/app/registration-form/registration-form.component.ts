import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import { RegistrationServiceService } from '../services/registration-service.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Country } from '../models/country.model';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, HttpClientModule],
  providers: [RegistrationServiceService,],
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.css'
})
export class RegistrationFormComponent implements OnInit{
  registrationForm: FormGroup;
  countries: Country[] = [];
  usernameAvailable: boolean | null = null; 
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private registrationService: RegistrationServiceService) {
    this.registrationForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.maxLength(20),
        this.lowercaseValidator()
      ]],
      country: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getCountries();
  }

  getCountries(): void {
    this.registrationService.getCountries().subscribe({
      next: (data) => {
        this.countries = data;
      },
      error: (error) => {
        console.error('Error fetching countries', error);
      }
    });
  }

  getErrorMessage(field: string): string | null {
    const control = this.registrationForm.get(field);

    if (control?.invalid && (control.touched || control.dirty)) {
      if (field === 'username') {
        if (control.hasError('required')) {
          return 'Username is required.';
        }
        if (control.hasError('maxlength')) {
          return 'Username cannot exceed 20 characters.';
        }
        if (control.hasError('lowercase')) {
          return 'Username must be in lowercase.';
        }
      }
    }
    return null; 
  }

  lowercaseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && value !== value.toLowerCase()) {
        return { lowercase: true };
      }
      return null;
    };
  }

  checkUsernameAvailability(): void {
   
    const username = this.registrationForm.get('username')?.value.toLowerCase();
    if (!username) {
      this.usernameAvailable = null;
      return;
    }

    if (this.getErrorMessage('username')) {
      return;
    }

    this.registrationService.checkUsernameAvailability(username).pipe(
      debounceTime(300)
    ).subscribe({
      next: (response) => {
        this.usernameAvailable = response.available;
      },
      error: (error) => {
        console.error('Error checking username availability', error);
      }
    });
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const { username, country } = this.registrationForm.value;
      this.registrationService.registerUser(username, country).subscribe({
        next: () => {
          this.errorMessage = null;
          this.registrationForm.reset();
          this.usernameAvailable = null;
        },
        error: (error) => {
          this.errorMessage = 'Registration failed. Please try again.';
          console.error('Error during registration', error);
        }
      });
    }
  }
}

