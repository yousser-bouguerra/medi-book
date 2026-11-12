import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap, throwError, timer } from 'rxjs';
import { Role, User } from './models';

interface Session {
  token: string;
  user: User;
}

type DemoUser = User & { password: string };

const DEMO_USERS: DemoUser[] = [
  { id: 1, name: 'Amel Ben Salah', email: 'patient@medibook.tn', password: 'Patient123!', role: 'PATIENT' },
  { id: 100, name: 'Dr. Karim Trabelsi', email: 'doctor@medibook.tn', password: 'Doctor123!', role: 'DOCTOR', doctorId: 1 }
];

const STORAGE_KEY = 'medibook.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private session = signal<Session | null>(this.load());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly role = computed<Role | null>(() => this.session()?.user.role ?? null);

  /** Demo login. Swap this with an HttpClient call to POST /api/auth/login once the API is connected. */
  login(email: string, password: string): Observable<User> {
    return timer(400).pipe(
      switchMap(() => {
        const found = DEMO_USERS.find(
          u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
        );
        if (!found) {
          return throwError(() => new Error('Invalid email or password.'));
        }
        const { password: _ignored, ...user } = found;
        const session: Session = { token: 'mock-jwt.' + btoa(user.email), user };
        this.session.set(session);
        this.save(session);
        return of(user);
      })
    );
  }

  logout(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    this.router.navigateByUrl('/login');
  }

  homePath(): string {
    switch (this.role()) {
      case 'DOCTOR': return '/doctor/agenda';
      case 'PATIENT': return '/patient/dashboard';
      default: return '/login';
    }
  }

  private load(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }

  private save(session: Session): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* storage unavailable */
    }
  }
}
