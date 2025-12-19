import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ApiService, Student, University } from '../services/api.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ReactiveFormsModule,
    TableModule,
    SelectModule,
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss',
})
export class StudentsComponent implements OnInit {
  registrationForm: FormGroup;
  students: Student[] = [];
  universities: Array<{ label: string; value: number }> = [];
  loading = false;
  error: string | null = null;
  editingStudent: Student | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.registrationForm = this.fb.group({
      facultyNumber: ['', [Validators.required, Validators.minLength(1)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      universityId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadStudents();
    this.loadUniversities();
  }

  loadStudents() {
    this.loading = true;
    this.error = null;
    this.apiService.getStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load students: ' + (err.error?.error || err.message);
        this.loading = false;
        console.error('Error loading students:', err);
      }
    });
  }

  loadUniversities() {
    this.apiService.getUniversities().subscribe({
      next: (universities) => {
        this.universities = universities.map(u => ({
          label: `${u.name} (${u.location})`,
          value: u.id
        }));
      },
      error: (err) => {
        this.error = 'Failed to load universities: ' + (err.error?.error || err.message);
        console.error('Error loading universities:', err);
      }
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.loading = true;
      this.error = null;
      const formValue = this.registrationForm.value;
      const studentData = {
        facultyNumber: formValue.facultyNumber,
        firstName: formValue.firstName,
        middleName: formValue.middleName || undefined,
        lastName: formValue.lastName,
        universityId: formValue.universityId
      };

      if (this.editingStudent?.id) {
        // Update existing student
        this.apiService.updateStudent(this.editingStudent.id, studentData).subscribe({
          next: (updatedStudent) => {
            const index = this.students.findIndex(s => s.id === updatedStudent.id);
            if (index !== -1) {
              this.students[index] = updatedStudent;
            }
            this.cancelEdit();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to update student: ' + (err.error?.error || err.message);
            this.loading = false;
            console.error('Error updating student:', err);
          }
        });
      } else {
        // Create new student
        this.apiService.createStudent(studentData).subscribe({
          next: (student) => {
            this.students.push(student);
            this.registrationForm.reset();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to create student: ' + (err.error?.error || err.message);
            this.loading = false;
            console.error('Error creating student:', err);
          }
        });
      }
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }

  editStudent(student: Student) {
    this.editingStudent = student;
    this.registrationForm.patchValue({
      facultyNumber: student.facultyNumber,
      firstName: student.firstName,
      middleName: student.middleName || '',
      lastName: student.lastName,
      universityId: student.universityId || student.university?.id
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingStudent = null;
    this.registrationForm.reset();
  }

  deleteStudent(student: Student) {
    if (!student.id) return;
    
    if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      this.loading = true;
      this.error = null;
      this.apiService.deleteStudent(student.id).subscribe({
        next: () => {
          this.students = this.students.filter(s => s.id !== student.id);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to delete student: ' + (err.error?.error || err.message);
          this.loading = false;
          console.error('Error deleting student:', err);
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
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

  getUniversityName(student: Student): string {
    return student.university?.name || 'N/A';
  }
}

