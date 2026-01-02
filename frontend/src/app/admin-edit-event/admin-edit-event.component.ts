import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ApiService } from '../services/api.service';

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
  selector: 'app-admin-edit-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
  templateUrl: './admin-edit-event.component.html',
})
export class AdminEditEventComponent implements OnInit {
  errorMsg = '';
  successMsg = '';
  loading = false;

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

  model: any = null;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!localStorage.getItem('jwt')) {
      this.router.navigateByUrl('/login');
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (!id) {
      this.router.navigateByUrl('/admin/events');
      return;
    }

    this.load(id);
  }

  load(id: number): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.getAdminEvent(id).subscribe({
    next: (e) => {
        this.loading = false;
        this.model = {
        ...e,
        startsAt: e.startsAt ? new Date(e.startsAt) : null,
        endsAt: e.endsAt ? new Date(e.endsAt) : null,
        };
    },
    error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error || 'Failed to load event.';
    },
    });

  }

  submit(): void {
    if (!this.model) return;

    this.errorMsg = '';
    this.successMsg = '';

    const payload = {
      title: this.model.title,
      description: this.model.description,
      type: this.model.type,
      startsAt: this.model.startsAt ? this.model.startsAt.toISOString() : null,
      endsAt: this.model.endsAt ? this.model.endsAt.toISOString() : null,
      city: this.model.city,
      venue: this.model.venue,
      imageUrl: this.model.imageUrl,
      priceCents: this.model.priceCents,
      totalSeats: this.model.totalSeats,
      status: this.model.status,
      isPublished: this.model.isPublished,
    };

    this.api.updateEvent(this.model.id, payload).subscribe({
      next: () => {
        this.successMsg = 'Event updated.';
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Update failed.';
      },
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/admin/events');
  }
}
