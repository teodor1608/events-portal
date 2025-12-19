import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CardModule, ButtonModule, DividerModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt');
  }
}
