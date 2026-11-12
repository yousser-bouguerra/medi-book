import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { initials } from '../core/utils';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="logo">+</span>
          <span>MediBook</span>
        </div>

        <nav class="nav">
          @if (auth.role() === 'PATIENT') {
            <a routerLink="/patient/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/patient/doctors" routerLinkActive="active">Find a doctor</a>
            <a routerLink="/patient/appointments" routerLinkActive="active">My appointments</a>
          } @else {
            <a routerLink="/doctor/agenda" routerLinkActive="active">My agenda</a>
          }
        </nav>

        <div class="user-box">
          <div class="avatar sm">{{ initials(auth.user()?.name ?? '') }}</div>
          <div class="user-info">
            <strong>{{ auth.user()?.name }}</strong>
            <small>{{ auth.role() === 'DOCTOR' ? 'Doctor' : 'Patient' }}</small>
          </div>
          <button class="btn ghost sm" (click)="auth.logout()">Log out</button>
        </div>
      </aside>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `
})
export class ShellComponent {
  auth = inject(AuthService);
  initials = initials;
}
