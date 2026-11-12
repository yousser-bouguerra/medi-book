import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Appointment } from '../core/models';
import { ToastService } from '../core/toast.service';

type Tab = 'upcoming' | 'past' | 'cancelled';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <header class="page-header">
      <div>
        <h1>My appointments</h1>
        <p class="muted">Manage your upcoming and past visits.</p>
      </div>
      <a class="btn primary" routerLink="/patient/doctors">New appointment</a>
    </header>

    <div class="tabs" role="tablist">
      @for (t of tabs; track t.key) {
        <button class="tab" role="tab" [class.active]="tab() === t.key" (click)="tab.set(t.key)">
          {{ t.label }} <span class="count">{{ counts()[t.key] }}</span>
        </button>
      }
    </div>

    @if (loading()) {
      <div class="skeleton-grid"><div class="skeleton"></div><div class="skeleton"></div></div>
    } @else if (visible().length === 0) {
      <div class="card empty"><p>Nothing to show here.</p></div>
    } @else {
      <div class="list">
        @for (a of visible(); track a.id) {
          <article class="card row">
            <div class="date-badge">
              <strong>{{ a.start | date: 'd' }}</strong>
              <span>{{ a.start | date: 'MMM' }}</span>
            </div>
            <div class="row-info">
              <strong>{{ a.doctorName }}</strong>
              <span class="muted">{{ a.specialty }} · {{ a.reason }}</span>
              <span class="time">{{ a.start | date: 'EEEE, HH:mm' }}</span>
            </div>
            <span class="badge" [class]="'badge ' + a.status.toLowerCase()">{{ a.status }}</span>
            @if (tab() === 'upcoming') {
              <button class="btn danger sm" (click)="cancel(a)">Cancel</button>
            }
          </article>
        }
      </div>
    }
  `
})
export class MyAppointmentsComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  loading = signal(true);
  tab = signal<Tab>('upcoming');
  appointments = signal<Appointment[]>([]);

  private byTab = computed(() => {
    const now = new Date();
    const all = this.appointments();
    return {
      upcoming: all.filter(a => a.status === 'SCHEDULED' && new Date(a.start) > now),
      past: all
        .filter(a => a.status === 'COMPLETED' || (a.status === 'SCHEDULED' && new Date(a.start) <= now))
        .reverse(),
      cancelled: all.filter(a => a.status === 'CANCELLED').reverse()
    };
  });

  visible = computed(() => this.byTab()[this.tab()]);
  counts = computed(() => ({
    upcoming: this.byTab().upcoming.length,
    past: this.byTab().past.length,
    cancelled: this.byTab().cancelled.length
  }));

  constructor() {
    this.load();
  }

  cancel(a: Appointment): void {
    if (!confirm(`Cancel your appointment with ${a.doctorName}?`)) return;
    this.api.setStatus(a.id, 'CANCELLED').subscribe({
      next: () => {
        this.toast.show('Appointment cancelled.');
        this.load();
      },
      error: (e: Error) => this.toast.show(e.message, 'error')
    });
  }

  private load(): void {
    this.api.myAppointments().subscribe(list => {
      this.appointments.set(list);
      this.loading.set(false);
    });
  }
}
