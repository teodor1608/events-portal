import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';

import { ApiService, AuthApiService } from '../services/api.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, PasswordModule, DividerModule, MessageModule],
  templateUrl: './account.component.html',
  styles: [
    `
    .form-row label { margin-top:0.75rem; display:block; }
    .form-row .p-inputtext, .form-row .p-password { margin-bottom:0.75rem; }
    .form-row button { margin-top:0.75rem; }
    .form-row { max-width:420px; margin:auto; }
    `,
  ],
})
export class AccountComponent implements OnInit {
  password = '';
  password2 = '';
  errorMsg = '';
  successMsg = '';

  // Link flow 
  linkMode = false;
  linkEmail: string | null = null;
  linkIdToken: string | null = null;
  linkPassword = '';
  linkError = '';
  linkSuccess = '';
  linking = false;

  constructor(private api: ApiService, private auth: AuthApiService, private router: Router) {}

  ngOnInit(): void {
    const idToken = sessionStorage.getItem('googleLinkIdToken');
    const email = sessionStorage.getItem('googleLinkEmail');
    if (idToken && email) {
      this.linkMode = true;
      this.linkEmail = email;
      this.linkIdToken = idToken;
    }
  }

  setPassword(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.password || this.password.length < 8) {
      this.errorMsg = 'Password must be at least 8 characters long.';
      return;
    }
    if (this.password !== this.password2) {
      this.errorMsg = 'Passwords do not match.';
      return;
    }

    this.api.setPassword(this.password).subscribe({
      next: () => {
        this.successMsg = 'Password set successfully.';
      },
      error: (err: any) => {
        this.errorMsg = err?.error?.error || 'Failed to set password.';
      }
    });
  }

  linkWithPassword(): void {
    this.linkError = '';
    this.linkSuccess = '';
    if (!this.linkPassword) {
      this.linkError = 'Please enter your current password to confirm.';
      return;
    }
    if (!this.linkEmail || !this.linkIdToken) {
      this.linkError = 'Link information is missing.';
      return;
    }

    this.linking = true;

    // JWT
    this.auth.login(this.linkEmail, this.linkPassword).subscribe({
      next: ({ token }) => {
        localStorage.setItem('jwt', token);
        // Now call link endpoint
        this.auth.linkGoogle(this.linkIdToken!).subscribe({
          next: () => {
            this.linkSuccess = 'Google account linked successfully.';
            sessionStorage.removeItem('googleLinkIdToken');
            sessionStorage.removeItem('googleLinkEmail');
            this.linkMode = false;
            this.linking = false;
            this.router.navigateByUrl('/');
          },
          error: (err: any) => {
            this.linkError = err?.error?.error || 'Failed to link Google account.';
            this.linking = false;
          },
        });
      },
      error: (err: any) => {
        this.linkError = err?.error?.error || 'Invalid credentials.';
        this.linking = false;
      }
    });
  }
}