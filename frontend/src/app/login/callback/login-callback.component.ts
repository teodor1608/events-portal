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
      next: (res: any) => {
        if (res.needsLink) {
          // Store idToken and email temporarily for the link flow (sessionStorage is cleared after use)
          sessionStorage.setItem('googleLinkIdToken', res.idToken);
          sessionStorage.setItem('googleLinkEmail', res.email);
          this.router.navigateByUrl('/account');
          return;
        }

        localStorage.setItem('jwt', res.token);
        // If account was linked or newly created and has no password, encourage setting a password
        if (res.linked || (!res.hasPassword && res.created)) {
          // Redirect to account page so user can set a password
          this.router.navigateByUrl('/account');
        } else {
          this.router.navigateByUrl('/');
        }
      },
      error: () => {
        this.router.navigateByUrl('/login');
      },
    });
  }
}
