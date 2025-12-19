import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { LoginCallbackComponent } from './login/callback/login-callback.component';
import { EventsComponent } from './events/events.component';
import { AdminCreateEventComponent } from './admin/admin-create-event/admin-create-event.component';
import { adminGuard } from './prot/admin.prot';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent 
  },
  { path: 'login', component: LoginComponent },
  { path: 'login/callback', component: LoginCallbackComponent },
  { path: 'events', component: EventsComponent },
  { path: 'admin/events/new', component: AdminCreateEventComponent, canActivate: [adminGuard] }
];
