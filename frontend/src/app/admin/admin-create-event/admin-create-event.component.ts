import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../services/api.service';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-admin-create-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    CheckboxModule,
    DividerModule,
    MessageModule,
  ],
  templateUrl: './admin-create-event.component.html',
})
export class AdminCreateEventComponent {
  errorMsg = '';
  successMsg = '';

  typeOptions = [
    { label: 'music', value: 'music' },
    { label: 'sports', value: 'sports' },
    { label: 'theatre', value: 'theatre' },
    { label: 'festival', value: 'festival' },
    { label: 'exhibition', value: 'exhibition' },
    { label: 'workshop', value: 'workshop' },
    { label: 'community', value: 'community' },
    { label: 'other', value: 'other' },
  ];

  statusOptions = [
    { label: 'DRAFT', value: 'DRAFT' },
    { label: 'SCHEDULED', value: 'SCHEDULED' },
    { label: 'CANCELLED', value: 'CANCELLED' },
    { label: 'COMPLETED', value: 'COMPLETED' },
  ];

  model: any = {
    title: '',
    description: '',
    type: 'music',
    startsAt: null as Date | null,
    endsAt: null as Date | null,
    city: '',
    venue: '',
    imageUrl: '',
    priceCents: 2000,
    currency: 'EUR',
    totalSeats: 50,
    status: 'SCHEDULED',
    isPublished: true,
  };

  constructor(private api: ApiService, private router: Router) {}

  submit(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.model.title || !this.model.startsAt || !this.model.city || !this.model.venue) {
      this.errorMsg = 'Title, startsAt, city, and venue are required.';
      return;
    }

    const payload = {
      ...this.model,
      startsAt: this.model.startsAt.toISOString(),
      endsAt: this.model.endsAt ? this.model.endsAt.toISOString() : null,
      imageUrl: this.model.imageUrl || null,
    };

    this.api.createEvent(payload).subscribe({
      next: () => {
        this.successMsg = 'Event created.';
        // optionally go back to events list
        // this.router.navigateByUrl('/events');
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Create failed.';
      },
    });
  }
}
