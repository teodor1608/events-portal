import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, MessageModule, ButtonModule, DividerModule],
  templateUrl: './payment-success.component.html',
})
export class PaymentSuccessComponent implements OnInit {
  loading = true;
  errorMsg = '';
  status: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (!sessionId) {
      this.loading = false;
      this.errorMsg = 'Missing payment session.';
      return;
    }

    if (!localStorage.getItem('jwt')) {
      this.loading = false;
      this.errorMsg = 'You must be logged in to confirm payment.';
      return;
    }

    this.api.confirmPayment(sessionId).subscribe({
      next: (res) => {
        this.loading = false;
        this.status = res.status || 'PAID';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error || 'Failed to confirm payment.';
      },
    });
  }

  goToReservations(): void {
    this.router.navigateByUrl('/my/reservations');
  }
}
