import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Appointment } from '../core/models';
import { initials } from '../core/utils';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <header class="page-header">
      <div>
        <h1>Hello, {{ firstName() }} 👋</h1>
        <p class="muted">Here is an overview of your appointments.</p>
      </div>
      <a class="btn primary" routerLink="/patient/doctors">Book an appointment</a>
    </header>

    @if (loading()) {
      <div class="skeleton-grid">
        <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
      </div>
    } @else {
      <section class="stats">
        <div class="stat"><span class="stat-value">{{ upcoming().length }}</span><span class="stat-label">Upcoming</span></div>
        <div class="stat"><span class="stat-value">{{ completed() }}</span><span class="stat-label">Completed</span></div>
        <div class="stat"><span class="stat-value">{{ cancelled() }}</span><span class="stat-label">Cancelled</span></div>
      </section>

      <section class="card">
        <h2>Next appointment</h2>
        @if (next(); as a) {
          <div class="next">
            <div class="avatar lg">{{ initials(a.doctorName) }}</div>
            <div class="next-info">
              <strong>{{ a.doctorName }}</strong>
              <span class="muted">{{ a.specialty }} · {{ a.reason }}</span>
            </div>
            <div class="next-date">
              <strong>{{ a.start | date: 'EEEE d MMMM' }}</strong>
              <span>{{ a.start | date: 'HH:mm' }}</span>
            </div>
          </div>
        } @else {
          <div class="empty">
            <p>You have no upcoming appointment.</p>
            <a class="btn primary sm" routerLink="/patient/doctors">Find a doctor</a>
          </div>
        }
      </section>
    }
  `
})
export class PatientDashboardComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  initials = initials;
  loading = signal(true);
  appointments = signal<Appointment[]>([]);

  firstName = computed(() => (this.auth.user()?.name ?? '').split(' ')[0]);
  upcoming = computed(() =>
    this.appointments().filter(a => a.status === 'SCHEDULED' && new Date(a.start) > new Date())
  );
  next = computed(() => this.upcoming()[0] ?? null);
  completed = computed(() => this.appointments().filter(a => a.status === 'COMPLETED').length);
  cancelled = computed(() => this.appointments().filter(a => a.status === 'CANCELLED').length);

  constructor() {
    this.api.myAppointments().subscribe(list => {
      this.appointments.set(list);
      this.loading.set(false);
    });
  }
}
