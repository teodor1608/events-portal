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
  styles: [
    `
    .auth-page { display:flex; align-items:center; justify-content:center; min-height:calc(100vh - 64px); padding:2rem; }
    .auth-card { width:420px; max-width:100%; }
    .form-row label { margin-top:0.75rem; display:block; }
    .form-row .p-inputtext, .form-row .p-password { margin-bottom:0.75rem; }
    .form-row button { margin-top:0.75rem; }

    .login-google { display:flex; flex-direction:column; gap:0.75rem; align-items:flex-start; margin-bottom:0.75rem; }

    .tab-headers { display:flex; gap:0.5rem; margin-bottom:1rem; }
    .tab-btn { min-width:110px; }
    .tab-btn[aria-pressed="true"] { font-weight:700; background:rgba(76,175,80,0.06); }

    @media (max-width:600px) {
      .auth-card { width:100%; }
    }
    `,
  ],
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

  // 0 = Login, 1 = Register
  activeTab = 0;

  constructor(private api: AuthApiService, private router: Router) {}

  ngOnInit(): void {
    // If already logged in, do NOT show login page
    if (localStorage.getItem('jwt')) {
      this.router.navigateByUrl('/');
    }
  }

  // Redirect-based Google login
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
