import { Component } from '@angular/core';

import { Router, RouterModule } from '@angular/router';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, ToolbarModule, ButtonModule],
  templateUrl: './navbar.component.html',
  styles: [
    `
    :host { display:block; margin-bottom:1rem; }
    .brand { display:flex; align-items:center; gap:0.5rem; text-decoration:none; color:inherit; font-weight:600; font-size:1.05rem; }
    .brand .pi { font-size:1.25rem; }
    .nav-actions { display:flex; gap:0.5rem; align-items:center; }
    .toolbar-button { padding-left:0.6rem; padding-right:0.6rem; }
    @media (max-width:600px) {
      .nav-actions { flex-direction:column; align-items:flex-end; }
    }
    `,
  ],
})
export class NavbarComponent {
  constructor(private router: Router) {}

  isAdmin(): boolean {
    const token = localStorage.getItem('jwt');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload?.role === 'ADMIN';
    } catch {
      return false;
    }
  }


  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt');
  }

  logout(): void {
    localStorage.removeItem('jwt');
    this.router.navigateByUrl('/');
  }
}
