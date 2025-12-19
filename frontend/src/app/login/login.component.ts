import { Component, OnInit } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';

import { AuthApiService } from '../services/api.service'; // your existing service
import { environment } from '../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CardModule,
    TabsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DividerModule,
    MessageModule
],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  // Local login
  loginEmail = '';
  loginPassword = '';

  // Signup
  signupEmail = '';
  signupPassword = '';
  signupPassword2 = '';

  errorMsg = '';

  constructor(private api: AuthApiService, private router: Router) {}

  ngOnInit(): void {
    // If already logged in, do NOT show login page
    if (localStorage.getItem('jwt')) {
      this.router.navigateByUrl('/');
    }
  }

  // Redirect-based Google login (no popup)
  loginWithGoogleRedirect(): void {
    const params = new URLSearchParams({
      client_id: environment.googleClientId,
      redirect_uri: environment.googleRedirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  loginLocal(): void {
    this.errorMsg = '';
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMsg = 'Email and password are required.';
      return;
    }

    this.api.login(this.loginEmail, this.loginPassword).subscribe({
      next: ({ token }) => {
        localStorage.setItem('jwt', token);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Login failed.';
      },
    });
  }

  signupLocal(): void {
    this.errorMsg = '';
    if (!this.signupEmail || !this.signupPassword || !this.signupPassword2) {
      this.errorMsg = 'All signup fields are required.';
      return;
    }
    if (this.signupPassword !== this.signupPassword2) {
      this.errorMsg = 'Passwords do not match.';
      return;
    }

    this.api.register(this.signupEmail, this.signupPassword).subscribe({
      next: ({ token }) => {
        localStorage.setItem('jwt', token);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Signup failed.';
      },
    });
  }
}
