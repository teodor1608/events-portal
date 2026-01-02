import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, MessageModule, ButtonModule, DividerModule],
  templateUrl: './payment-cancel.component.html',
})
export class PaymentCancelComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigateByUrl('/my/reservations');
  }
}
