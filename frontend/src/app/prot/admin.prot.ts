import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

function decodeJwtPayload(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('jwt');
  if (!token) return router.parseUrl('/login');

  const payload = decodeJwtPayload(token);
  if (payload?.role === 'ADMIN') return true;

  return router.parseUrl('/');
};
