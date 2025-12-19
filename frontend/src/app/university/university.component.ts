import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ApiService, University } from '../services/api.service';

@Component({
  selector: 'app-university',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    ReactiveFormsModule,
  ],
  templateUrl: './university.component.html',
  styleUrl: './university.component.scss',
})
export class UniversityComponent implements OnInit {
  universityForm: FormGroup;
  universities: University[] = [];
  loading = false;
  error: string | null = null;
  editingUniversity: University | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.universityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      location: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() {
    this.loadUniversities();
  }

  loadUniversities() {
    this.loading = true;
    this.error = null;
    this.apiService.getUniversities().subscribe({
      next: (universities) => {
        this.universities = universities;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load universities: ' + (err.error?.error || err.message);
        this.loading = false;
        console.error('Error loading universities:', err);
      }
    });
  }

  onSubmit() {
    if (this.universityForm.valid) {
      this.loading = true;
      this.error = null;
      const formValue = this.universityForm.value;
      const universityData = {
        name: formValue.name,
        location: formValue.location
      };

      if (this.editingUniversity?.id) {
        // Update existing university
        this.apiService.updateUniversity(this.editingUniversity.id, universityData).subscribe({
          next: (updatedUniversity) => {
            const index = this.universities.findIndex(u => u.id === updatedUniversity.id);
            if (index !== -1) {
              this.universities[index] = updatedUniversity;
            }
            this.cancelEdit();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to update university: ' + (err.error?.error || err.message);
            this.loading = false;
            console.error('Error updating university:', err);
          }
        });
      } else {
        // Create new university
        this.apiService.createUniversity(universityData).subscribe({
          next: (university) => {
            this.universities.push(university);
            this.universityForm.reset();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to create university: ' + (err.error?.error || err.message);
            this.loading = false;
            console.error('Error creating university:', err);
          }
        });
      }
    } else {
      this.universityForm.markAllAsTouched();
    }
  }

  editUniversity(university: University) {
    this.editingUniversity = university;
    this.universityForm.patchValue({
      name: university.name,
      location: university.location
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingUniversity = null;
    this.universityForm.reset();
  }

  deleteUniversity(university: University) {
    if (!university.id) return;
    
    if (confirm(`Are you sure you want to delete ${university.name}?`)) {
      this.loading = true;
      this.error = null;
      this.apiService.deleteUniversity(university.id).subscribe({
        next: () => {
          this.universities = this.universities.filter(u => u.id !== university.id);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to delete university: ' + (err.error?.error || err.message);
          this.loading = false;
          console.error('Error deleting university:', err);
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.universityForm.get(fieldName);
    if (field?.touched && field?.invalid) {
      if (field.errors?.['required']) {
        return 'This field is required';
      }
      if (field.errors?.['minlength']) {
        return 'Minimum length is 2 characters';
      }
    }
    return '';
  }
}

