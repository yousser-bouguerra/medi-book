import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Doctor } from '../core/models';
import { initials, stars } from '../core/utils';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <div>
        <h1>Find a doctor</h1>
        <p class="muted">Search by name, city or specialty.</p>
      </div>
    </header>

    <div class="filters">
      <input class="search" type="search" placeholder="Search a doctor, a city…"
             (input)="query.set($any($event.target).value)">
      <select (change)="specialty.set($any($event.target).value)">
        <option value="">All specialties</option>
        @for (s of specialties(); track s) {
          <option [value]="s">{{ s }}</option>
        }
      </select>
    </div>

    @if (loading()) {
      <div class="skeleton-grid">
        <div class="skeleton tall"></div><div class="skeleton tall"></div><div class="skeleton tall"></div>
      </div>
    } @else if (filtered().length === 0) {
      <div class="card empty"><p>No doctor matches your search.</p></div>
    } @else {
      <div class="grid">
        @for (d of filtered(); track d.id) {
          <article class="card doctor-card">
            <div class="doctor-head">
              <div class="avatar lg" [style.background]="d.color">{{ initials(d.name) }}</div>
              <div>
                <h3>{{ d.name }}</h3>
                <span class="chip">{{ d.specialty }}</span>
              </div>
            </div>
            <p class="muted bio">{{ d.bio }}</p>
            <div class="meta">
              <span class="rating" [attr.aria-label]="'Rating ' + d.rating">{{ stars(d.rating) }} {{ d.rating }}</span>
              <span>📍 {{ d.city }}</span>
              <span>{{ d.yearsExperience }} yrs exp.</span>
            </div>
            <a class="btn primary block" [routerLink]="['/patient/doctors', d.id]">View availability</a>
          </article>
        }
      </div>
    }
  `
})
export class DoctorsComponent {
  private api = inject(ApiService);

  initials = initials;
  stars = stars;
  loading = signal(true);
  doctors = signal<Doctor[]>([]);
  query = signal('');
  specialty = signal('');

  specialties = computed(() => [...new Set(this.doctors().map(d => d.specialty))].sort());
  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const s = this.specialty();
    return this.doctors().filter(
      d => (!s || d.specialty === s) && (!q || `${d.name} ${d.city} ${d.specialty}`.toLowerCase().includes(q))
    );
  });

  constructor() {
    this.api.getDoctors().subscribe(list => {
      this.doctors.set(list);
      this.loading.set(false);
    });
  }
}
