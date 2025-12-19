import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { LoginCallbackComponent } from './login/callback/login-callback.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent 
  },
  { path: 'login', component: LoginComponent },
  { path: 'login/callback', component: LoginCallbackComponent }

];
