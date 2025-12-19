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
  startsAt: string;   // ISO string
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

  updateEvent(id: number, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${API_URL}/events/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/events/${id}`);
  }

  holdReservation(eventId: number, qty: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${API_URL}/reservations`, { eventId, qty });
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${API_URL}/users/me/reservations`);
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

}