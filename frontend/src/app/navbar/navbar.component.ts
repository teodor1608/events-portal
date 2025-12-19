import { Component } from '@angular/core';

import { Router, RouterModule } from '@angular/router';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, ToolbarModule, ButtonModule],
  templateUrl: './navbar.component.html',
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
