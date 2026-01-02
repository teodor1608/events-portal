import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { LoginCallbackComponent } from './login/callback/login-callback.component';
import { EventsComponent } from './events/events.component';
import { AdminCreateEventComponent } from './admin/admin-create-event/admin-create-event.component';
import { adminGuard } from './prot/admin.prot';
import { EventDetailsComponent } from './event-details/event-details.component';
import { MyReservationsComponent } from './my-reservations/my-reservations.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentCancelComponent } from './payment-cancel/payment-cancel.component';
import { AdminEditEventComponent } from './admin-edit-event/admin-edit-event.component';
import { AdminEventsComponent } from './admin-events/admin-events.component';
import { AccountComponent } from './account/account.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login/callback', component: LoginCallbackComponent },
  { path: 'events', component: EventsComponent },
  { path: 'admin/events/new', component: AdminCreateEventComponent, canActivate: [adminGuard] },
  { path: 'events/:id', component: EventDetailsComponent },
  { path: 'my/reservations', component: MyReservationsComponent },
  { path: 'payment/success', component: PaymentSuccessComponent },
  { path: 'payment/cancel', component: PaymentCancelComponent },
  { path: 'admin/events', component: AdminEventsComponent },
  { path: 'admin/events/:id/edit', component: AdminEditEventComponent },
  { path: 'account', component: AccountComponent },
];
