import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api';

export type EventType =
  | 'music' | 'sports' | 'theatre' | 'festival'
  | 'exhibition' | 'workshop' | 'community' | 'other';

export type EventStatus = 'DRAFT' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

export interface Event {
  id?: number;
  title: string;
  description?: string | null;
  type: EventType;
  startsAt: string;
  endsAt?: string | null;
  city: string;
  venue: string;
  imageUrl?: string | null;
  priceCents: number;
  currency?: 'EUR';
  totalSeats: number;
  availableSeats?: number;
  status: EventStatus;
  isPublished: boolean;
}

export type ReservationStatus = 'HELD' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export interface Reservation {
  id: number;
  eventId: number;
  userId: number;
  qty: number;
  status: ReservationStatus;
  holdExpiresAt: string;
  createdAt: string;
  event?: Event | null;
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}
  
  getEvents(params?: { from?: string; to?: string; type?: EventType }): Observable<Event[]> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.type) qs.set('type', params.type);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.http.get<Event[]>(`${API_URL}/events${suffix}`);
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${API_URL}/events/${id}`);
  }

  createEvent(event: Omit<Event, 'id' | 'availableSeats' | 'currency'>): Observable<Event> {
    return this.http.post<Event>(`${API_URL}/events`, event);
  }

  getAdminEvents() {
    return this.http.get<any[]>(`${API_URL}/events/admin`);
  }

  getAdminEvent(id: number) {
    return this.http.get<any>(`${API_URL}/events/admin/${id}`);
  }


  updateEvent(id: number, payload: any) {
    return this.http.put<any>(`${API_URL}/events/${id}`, payload);
  }

  deleteEvent(id: number) {
    return this.http.delete<{ success: boolean }>(`${API_URL}/events/${id}`);
  }

  createReservation(eventId: number, qty: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${API_URL}/reservations`, { eventId, qty });
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${API_URL}/users/me/reservations`);
  }

  createCheckoutSession(reservationId: number) {
    return this.http.post<{ url: string }>(
      `${API_URL}/payments/create-checkout-session`,
      { reservationId }
    );
  }

  confirmPayment(sessionId: string) {
    return this.http.get<{ status: string }>(
      `${API_URL}/payments/confirm`,
      {
        params: { session_id: sessionId },
      }
    );
  }

  checkinReservation(reservationId: number) : Observable<Reservation> {
    return this.http.post<Reservation>(`${API_URL}/checkin`, { reservationId });
  }

  setPassword(password: string) {
    return this.http.post(`${API_URL}/auth/set-password`, { password });
  }

}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  constructor(private http: HttpClient) {}

  googleLogin(idToken: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${API_URL}/auth/google`, { idToken });
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${API_URL}/auth/login`, { email, password });
  }

  register(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${API_URL}/auth/register`, { email, password });
  }

  googleLoginRedirect(code: string) {
  return this.http.post<{ token: string }>(
    `${API_URL}/auth/google/redirect`,
      { code }
    );
  }

  // Link a Google idToken to the currently authenticated user
  linkGoogle(idToken: string) {
    return this.http.post(`${API_URL}/auth/google/link`, { idToken });
  }

  setPassword(password: string) {
    return this.http.post(`${API_URL}/auth/set-password`, { password });
  }

}