import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Doctor, Slot } from '../core/models';
import { ToastService } from '../core/toast.service';
import { initials, stars, todayStr } from '../core/utils';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <a class="back" routerLink="/patient/doctors">← Back to doctors</a>

    @if (!loaded()) {
      <div class="skeleton tall"></div>
    } @else if (!doctor()) {
      <div class="card empty"><p>This doctor does not exist.</p></div>
    } @else {
      @let d = doctor()!;
      <section class="card profile">
        <div class="avatar xl" [style.background]="d.color">{{ initials(d.name) }}</div>
        <div>
          <h1>{{ d.name }}</h1>
          <span class="chip">{{ d.specialty }}</span>
          <p class="muted">{{ d.bio }}</p>
          <div class="meta">
            <span class="rating">{{ stars(d.rating) }} {{ d.rating }}</span>
            <span>📍 {{ d.city }}</span>
            <span>{{ d.yearsExperience }} years of experience</span>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>Book an appointment</h2>

        <label class="field inline">
          <span>Date</span>
          <input type="date" [value]="date()" [min]="today" (change)="onDate($any($event.target).value)">
        </label>

        <div class="slots" role="listbox" aria-label="Available time slots">
          @for (s of slots(); track s.iso) {
            <button type="button" class="slot"
                    [class.selected]="selected()?.iso === s.iso"
                    [disabled]="!s.available"
                    (click)="selected.set(s)">
              {{ s.time }}
            </button>
          }
        </div>

        <label class="field">
          <span>Reason for visit (optional)</span>
          <textarea rows="3" placeholder="Briefly describe your symptoms or the reason for the visit"
                    (input)="reason.set($any($event.target).value)"></textarea>
        </label>

        <div class="summary">
          @if (selected(); as s) {
            <span>Selected: <strong>{{ s.iso | date: 'EEE d MMM, HH:mm' }}</strong></span>
          } @else {
            <span class="muted">Select a time slot to continue.</span>
          }
          <button class="btn primary" [disabled]="!selected() || booking()" (click)="book()">
            {{ booking() ? 'Booking…' : 'Confirm appointment' }}
          </button>
        </div>
      </section>
    }
  `
})
export class DoctorDetailComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  initials = initials;
  stars = stars;
  today = todayStr();

  loaded = signal(false);
  doctor = signal<Doctor | undefined>(undefined);
  date = signal(todayStr());
  slots = signal<Slot[]>([]);
  selected = signal<Slot | null>(null);
  reason = signal('');
  booking = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getDoctor(id).subscribe(d => {
      this.doctor.set(d);
      this.loaded.set(true);
      if (d) this.loadSlots();
    });
  }

  onDate(value: string): void {
    if (!value) return;
    this.date.set(value);
    this.loadSlots();
  }

  book(): void {
    const slot = this.selected();
    const doctor = this.doctor();
    if (!slot || !doctor) return;
    this.booking.set(true);
    this.api.book(doctor.id, slot.iso, this.reason()).subscribe({
      next: () => {
        this.toast.show('Appointment confirmed!');
        this.router.navigateByUrl('/patient/appointments');
      },
      error: (e: Error) => {
        this.toast.show(e.message, 'error');
        this.booking.set(false);
        this.loadSlots();
      }
    });
  }

  private loadSlots(): void {
    const doctor = this.doctor();
    if (!doctor) return;
    this.selected.set(null);
    this.api.getSlots(doctor.id, this.date()).subscribe(s => this.slots.set(s));
  }
}
