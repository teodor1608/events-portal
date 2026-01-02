import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    DividerModule,
    SelectModule,
  ],
  templateUrl: './admin-events.component.html',
})
export class AdminEventsComponent implements OnInit {
  allEvents: any[] = [];
  events: any[] = [];
  loading = false;
  errorMsg = '';

  filterOptions = [
    { label: 'Active (not cancelled)', value: 'active' },
    { label: 'Cancelled only', value: 'cancelled' },
  ];
  filterMode: 'active' | 'cancelled' = 'active';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    if (!localStorage.getItem('jwt')) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.getAdminEvents().subscribe({
      next: (data) => {
        this.allEvents = data ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error || 'Failed to load events.';
      },
    });
  }

  applyFilter(): void {
    if (this.filterMode === 'active') {
      this.events = this.allEvents.filter(e => e.status !== 'CANCELLED');
    } else {
      this.events = this.allEvents.filter(e => e.status === 'CANCELLED');
    }
  }

  statusSeverity(e: any): 'success' | 'warn' | 'danger' | 'info' {
    switch (e.status) {
      case 'SCHEDULED': return 'success';
      case 'DRAFT': return 'info';
      case 'CANCELLED': return 'danger';
      case 'COMPLETED': return 'warn';
      default: return 'info';
    }
  }

  pubSeverity(e: any): 'success' | 'danger' | 'info' {
    return e.isPublished ? 'success' : 'info';
  }

  goNew(): void {
    this.router.navigateByUrl('/admin/events/new');
  }

  goEdit(e: any): void {
    this.router.navigate(['/admin/events', e.id, 'edit']);
  }

  delete(e: any): void {
    if (!confirm(`Delete event "${e.title}"?`)) {
      return;
    }

    this.errorMsg = '';

    this.api.deleteEvent(e.id).subscribe({
      next: () => {
        this.load();
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Delete failed.';
      },
    });
  }
}
