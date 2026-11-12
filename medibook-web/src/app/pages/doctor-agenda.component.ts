import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Appointment, AppointmentStatus } from '../core/models';
import { ToastService } from '../core/toast.service';
import { initials } from '../core/utils';

@Component({
  selector: 'app-doctor-agenda',
  standalone: true,
  imports: [DatePipe],
  template: `
    <header class="page-header">
      <div>
        <h1>My agenda</h1>
        <p class="muted">Appointments booked by your patients.</p>
      </div>
    </header>

    <section class="stats">
      <div class="stat"><span class="stat-value">{{ todayCount() }}</span><span class="stat-label">Today</span></div>
      <div class="stat"><span class="stat-value">{{ upcoming().length }}</span><span class="stat-label">Upcoming</span></div>
      <div class="stat"><span class="stat-value">{{ completed() }}</span><span class="stat-label">Completed</span></div>
    </section>

    @if (loading()) {
      <div class="skeleton-grid"><div class="skeleton"></div><div class="skeleton"></div></div>
    } @else if (appointments().length === 0) {
      <div class="card empty"><p>No appointments yet.</p></div>
    } @else {
      <div class="list">
        @for (a of appointments(); track a.id) {
          <article class="card row">
            <div class="avatar">{{ initials(a.patientName) }}</div>
            <div class="row-info">
              <strong>{{ a.patientName }}</strong>
              <span class="muted">{{ a.reason }}</span>
              <span class="time">{{ a.start | date: 'EEE d MMM · HH:mm' }}</span>
            </div>
            <span [class]="'badge ' + a.status.toLowerCase()">{{ a.status }}</span>
            @if (a.status === 'SCHEDULED') {
              <div class="actions">
                <button class="btn primary sm" (click)="update(a, 'COMPLETED')">Complete</button>
                <button class="btn danger sm" (click)="update(a, 'CANCELLED')">Cancel</button>
              </div>
            }
          </article>
        }
      </div>
    }
  `
})
export class DoctorAgendaComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  initials = initials;
  loading = signal(true);
  appointments = signal<Appointment[]>([]);

  todayCount = computed(() => {
    const today = new Date().toDateString();
    return this.appointments().filter(a => a.status === 'SCHEDULED' && new Date(a.start).toDateString() === today).length;
  });
  upcoming = computed(() =>
    this.appointments().filter(a => a.status === 'SCHEDULED' && new Date(a.start) > new Date())
  );
  completed = computed(() => this.appointments().filter(a => a.status === 'COMPLETED').length);

  constructor() {
    this.load();
  }

  update(a: Appointment, status: AppointmentStatus): void {
    this.api.setStatus(a.id, status).subscribe({
      next: () => {
        this.toast.show(status === 'COMPLETED' ? 'Appointment marked as completed.' : 'Appointment cancelled.');
        this.load();
      },
      error: (e: Error) => this.toast.show(e.message, 'error')
    });
  }

  private load(): void {
    this.api.doctorAgenda().subscribe(list => {
      this.appointments.set(list);
      this.loading.set(false);
    });
  }
}
