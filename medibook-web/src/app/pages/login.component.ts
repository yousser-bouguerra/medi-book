import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-page">
          <section class="login-hero">
        <div class="brand light"><span class="logo">+</span><span>MediBook</span></div>
        <h1>Your health, on your schedule.</h1>
        <p>Book an appointment in under a minute.</p>
        <ul>
          <li>Find a doctor</li>
          <li>Pick a slot</li>
          <li>Get confirmed</li>
        </ul>
      </section>

      <section class="login-panel">
        <form class="login-card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <h2>Welcome back</h2>
          <p class="muted">Sign in to your account</p>

          <label class="field">
            <span>Email</span>
            <input type="email" formControlName="email" placeholder="you@example.com" autocomplete="username">
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <small class="error-text">Enter a valid email address.</small>
            }
          </label>

          <label class="field">
            <span>Password</span>
            <input type="password" formControlName="password" placeholder="••••••••" autocomplete="current-password">
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <small class="error-text">Password must be at least 6 characters.</small>
            }
          </label>

          @if (error()) {
            <div class="alert">{{ error() }}</div>
          }

          <button class="btn primary block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>

          <div class="demo">
            <span class="muted">Demo accounts</span>
            <div class="demo-buttons">
              <button type="button" class="btn ghost sm" (click)="fill('patient')">Patient</button>
              <button type="button" class="btn ghost sm" (click)="fill('doctor')">Doctor</button>
            </div>
          </div>
        </form>
      </section>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  fill(kind: 'patient' | 'doctor'): void {
    this.form.setValue(
      kind === 'patient'
        ? { email: 'patient@medibook.tn', password: 'Patient123!' }
        : { email: 'doctor@medibook.tn', password: 'Doctor123!' }
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl(this.auth.homePath()),
      error: (e: Error) => {
        this.error.set(e.message);
        this.loading.set(false);
      }
    });
  }
}
