import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ApiService, Reservation } from '../services/api.service';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './checkin.component.html',
  styles: [
    `
    .checkin-page { min-height: 100vh; padding: 2rem 0; }
    .checkin-card { border: 1px solid #ddd; border-radius: 8px; padding: 2rem; max-width: 420px; margin: 0 auto; }
    .info-row { margin-bottom: 1rem; }
    .checkin-btn { margin-bottom: 1rem; width: 100%; font-size: 1rem; }
    .message { margin-bottom: 1rem; }
    .reservation-info { border-radius: 4px; padding: 0.75rem; margin-top: 1rem; border: 1px solid #eee; }
    `
  ]
})
export class CheckinComponent implements OnInit {
  reservationIdInput = '';
  loading = false;
  message: string | null = null;
  reservation: Reservation | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const reservationId = this.route.snapshot.queryParamMap.get('reservationId');
    if (reservationId) {
      this.reservationIdInput = reservationId;
    }
  }

  checkIn(): void {
    this.message = null;
    this.reservation = null;

    const trimmed = this.reservationIdInput.trim();
    const id = Number(trimmed);

    if (!trimmed || Number.isNaN(id)) {
      this.message = 'Invalid reservation ID';
      return;
    }

    this.loading = true;

    this.api.checkinReservation(id).subscribe({
      next: (res: Reservation) => {
        this.loading = false;
        this.reservation = res;
        this.message = 'Check-in successful';
      },
      error: (err) => {
        this.loading = false;
        console.error('Check-in request failed', err);
        this.message = err.error?.error || 'Failed to process check-in';
      },
    });
  }
}
