import { ActivatedRoute, Router } from "@angular/router";
import { AuthApiService } from "../../services/api.service";
import { OnInit } from "@angular/core";
import { Component } from '@angular/core';


@Component({
  selector: 'app-login-callback',
  template: `<p>Logging in...</p>`,
})
export class LoginCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private auth: AuthApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.auth.googleLoginRedirect(code).subscribe({
      next: ({ token }) => {
        localStorage.setItem('jwt', token);
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.router.navigateByUrl('/login');
      },
    });
  }
}
