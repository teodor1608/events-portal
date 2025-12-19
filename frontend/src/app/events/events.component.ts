import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ApiService, Event, EventType } from '../services/api.service';

import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DataViewModule,
    CardModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    DividerModule,
  ],
  templateUrl: './events.component.html',
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  loading = false;

  typeOptions: { label: string; value: EventType | null }[] = [
    { label: 'All types', value: null },
    { label: 'Music', value: 'music' },
    { label: 'Sports', value: 'sports' },
    { label: 'Theatre', value: 'theatre' },
    { label: 'Festival', value: 'festival' },
    { label: 'Exhibition', value: 'exhibition' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Community', value: 'community' },
    { label: 'Other', value: 'other' },
  ];

  selectedType: EventType | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    console.log('Loading events with filters:', {
      from: this.fromDate,
      to: this.toDate,
      type: this.selectedType,
    });

    const from = this.fromDate ? this.fromDate.toISOString() : undefined;
    const to = this.toDate ? this.toDate.toISOString() : undefined;

    this.api.getEvents({
      from,
      to,
      type: this.selectedType ?? undefined,
    }).subscribe({
      next: (data) => {
        this.events = data ?? [];
        this.loading = false;
        console.log('Loaded events:', this.events);
      },
      error: () => {
        this.events = [];
        this.loading = false;
      },
    });
  }

  clearFilters(): void {
    this.selectedType = null;
    this.fromDate = null;
    this.toDate = null;
    this.load();
  }

  euros(priceCents: number): string {
    return (priceCents / 100).toFixed(2);
  }

  when(startsAt: string): string {
    return new Date(startsAt).toLocaleString();
  }
}
