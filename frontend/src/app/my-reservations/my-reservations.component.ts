import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { ApiService, Reservation } from '../services/api.service';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    DividerModule,
    MessageModule,
  ],
  templateUrl: './my-reservations.component.html',
})
export class MyReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = false;
  errorMsg = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    // Redirect to login if the user is not authenticated
    if (!localStorage.getItem('jwt')) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.getMyReservations().subscribe({
      next: (data) => {
        this.reservations = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error || 'Failed to load reservations.';
      },
    });
  }

  eventTitle(r: Reservation): string {
    return r.event?.title || '(event deleted)';
  }

  eventDate(r: Reservation): string {
    return r.event?.startsAt
      ? new Date(r.event.startsAt).toLocaleString()
      : '';
  }

  statusSeverity(r: Reservation): 'success' | 'warn' | 'danger' | 'info' {
    switch (r.status) {
      case 'PAID': return 'success';
      case 'HELD': return 'info';
      case 'EXPIRED': return 'warn';
      case 'CANCELLED': return 'danger';
      default: return 'info';
    }
  }

  payNow(r: Reservation): void {
    this.api.createCheckoutSession(r.id).subscribe({
        next: ({ url }) => {
        if (url) {
            window.location.href = url; // go to Stripe Checkout
        }
        },
        error: (err) => {
        this.errorMsg = err?.error?.error || 'Failed to start payment.';
        },
    });
    }

}
