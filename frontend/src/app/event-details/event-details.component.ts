import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';

import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    DividerModule,
    InputNumberModule,
    MessageModule,
  ],
  templateUrl: './event-details.component.html',
})
export class EventDetailsComponent implements OnInit {
  event: any | null = null;
  loading = false;
  errorMsg = '';
  successMsg = '';
  qty = 1;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (!id) {
      this.router.navigateByUrl('/events');
      return;
    }

    this.loadEvent(id);
  }

  private loadEvent(id: number): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.getEvent(id).subscribe({
      next: (e) => {
        this.event = e;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error || 'Event not found.';
      },
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt');
  }

  canReserve(): boolean {
    if (!this.event) return false;
    if (!this.isLoggedIn()) return false;
    if (this.event.availableSeats <= 0) return false;
    if (this.qty < 1) return false;
    if (this.qty > this.event.availableSeats) return false;
    return true;
  }

  reserve(): void {
    if (!this.event) return;

    this.errorMsg = '';
    this.successMsg = '';

    this.api.createReservation(this.event.id, this.qty).subscribe({
    next: () => {
        this.successMsg = `Reserved ${this.qty} seat(s).`;
        this.event.availableSeats -= this.qty;
    },
    error: (err) => {
        this.errorMsg = err?.error?.error || 'Reservation failed.';
    },
    });
  }

  euros(priceCents: number | undefined): string {
    if (!priceCents && priceCents !== 0) return '';
    return (priceCents / 100).toFixed(2);
  }

  when(startsAt: string | undefined): string {
    return startsAt ? new Date(startsAt).toLocaleString() : '';
  }
}
