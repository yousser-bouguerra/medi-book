import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, throwError, timer } from 'rxjs';
import { AuthService } from './auth.service';
import { Appointment, AppointmentStatus, Doctor, Slot } from './models';
import { pad } from './utils';

const DOCTORS: Doctor[] = [
  { id: 1, name: 'Dr. Karim Trabelsi', specialty: 'Cardiology', city: 'Tunis', rating: 4.9, yearsExperience: 15, color: '#0f766e',
    bio: 'Cardiologist focused on preventive care, hypertension and heart failure follow-up.' },
  { id: 2, name: 'Dr. Salma Haddad', specialty: 'Dermatology', city: 'Ariana', rating: 4.8, yearsExperience: 11, color: '#7c3aed',
    bio: 'Treats acne, eczema and skin allergies, and performs dermatological check-ups.' },
  { id: 3, name: 'Dr. Youssef Ben Amor', specialty: 'Pediatrics', city: 'Sousse', rating: 4.7, yearsExperience: 9, color: '#ea580c',
    bio: 'Pediatrician caring for newborns, children and teenagers, including vaccinations.' },
  { id: 4, name: 'Dr. Nour Chaabane', specialty: 'Dentistry', city: 'Tunis', rating: 4.6, yearsExperience: 7, color: '#0284c7',
    bio: 'General dentist offering check-ups, cleaning, fillings and cosmetic treatments.' },
  { id: 5, name: 'Dr. Mehdi Kallel', specialty: 'Neurology', city: 'Sfax', rating: 4.9, yearsExperience: 18, color: '#be123c',
    bio: 'Neurologist specialised in migraines, epilepsy and sleep disorders.' },
  { id: 6, name: 'Dr. Ines Mabrouk', specialty: 'General Medicine', city: 'Ariana', rating: 4.5, yearsExperience: 6, color: '#15803d',
    bio: 'Family doctor for routine consultations, prescriptions and referrals.' }
];

/**
 * In-memory API used for the demo.
 * Each method returns an Observable, exactly like an HttpClient-based service would,
 * so it can be replaced by real calls to the ASP.NET Core REST API without touching the components.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private auth = inject(AuthService);
  private appointments: Appointment[] = this.seed();
  private nextId = 100;

  getDoctors(): Observable<Doctor[]> {
    return this.respond(() => [...DOCTORS]);
  }

  getDoctor(id: number): Observable<Doctor | undefined> {
    return this.respond(() => DOCTORS.find(d => d.id === id));
  }

  getSlots(doctorId: number, date: string): Observable<Slot[]> {
    return this.respond(() => {
      const times: string[] = [];
      for (let h = 9; h < 17; h++) {
        for (const m of [0, 30]) {
          if (h === 12 || (h === 13 && m === 0)) continue; // lunch break
          times.push(`${pad(h)}:${pad(m)}`);
        }
      }
      const now = new Date();
      return times.map(time => {
        const iso = this.toIso(date, time);
        const taken = this.appointments.some(
          a => a.doctorId === doctorId && a.status === 'SCHEDULED' && a.start === iso
        );
        return { time, iso, available: !taken && new Date(iso) > now };
      });
    });
  }

  book(doctorId: number, startIso: string, reason: string): Observable<Appointment> {
    return this.respond(() => {
      const user = this.auth.user();
      const doctor = DOCTORS.find(d => d.id === doctorId);
      if (!user || !doctor) throw new Error('Unable to book this appointment.');
      if (new Date(startIso) <= new Date()) throw new Error('The appointment must be in the future.');
      const taken = this.appointments.some(
        a => a.doctorId === doctorId && a.status === 'SCHEDULED' && a.start === startIso
      );
      if (taken) throw new Error('This time slot has just been taken. Please choose another one.');

      const appointment: Appointment = {
        id: this.nextId++,
        doctorId,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        patientId: user.id,
        patientName: user.name,
        start: startIso,
        status: 'SCHEDULED',
        reason: reason.trim() || 'General consultation'
      };
      this.appointments.push(appointment);
      return appointment;
    });
  }

  myAppointments(): Observable<Appointment[]> {
    return this.respond(() => {
      const user = this.auth.user();
      return this.appointments
        .filter(a => a.patientId === user?.id)
        .sort((a, b) => a.start.localeCompare(b.start));
    });
  }

  doctorAgenda(): Observable<Appointment[]> {
    return this.respond(() => {
      const doctorId = this.auth.user()?.doctorId;
      return this.appointments
        .filter(a => a.doctorId === doctorId)
        .sort((a, b) => a.start.localeCompare(b.start));
    });
  }

  setStatus(id: number, status: AppointmentStatus): Observable<Appointment> {
    return this.respond(() => {
      const appointment = this.appointments.find(a => a.id === id);
      if (!appointment) throw new Error('Appointment not found.');
      const user = this.auth.user();
      const isOwner = appointment.patientId === user?.id;
      const isDoctor = appointment.doctorId === user?.doctorId;
      if (!isOwner && !isDoctor) throw new Error('You are not allowed to modify this appointment.');
      if (appointment.status !== 'SCHEDULED') throw new Error('Only scheduled appointments can be changed.');
      appointment.status = status;
      return { ...appointment };
    });
  }

  private respond<T>(fn: () => T): Observable<T> {
    return timer(250).pipe(
      switchMap(() => {
        try {
          return of(fn());
        } catch (e) {
          return throwError(() => e);
        }
      })
    );
  }

  private toIso(date: string, time: string): string {
    const [y, mo, d] = date.split('-').map(Number);
    const [h, mi] = time.split(':').map(Number);
    return new Date(y, mo - 1, d, h, mi, 0, 0).toISOString();
  }

  private seed(): Appointment[] {
    const at = (days: number, h: number, m = 0): string => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    };
    return [
      { id: 1, doctorId: 1, doctorName: 'Dr. Karim Trabelsi', specialty: 'Cardiology', patientId: 1, patientName: 'Amel Ben Salah', start: at(2, 10), status: 'SCHEDULED', reason: 'Annual check-up' },
      { id: 2, doctorId: 2, doctorName: 'Dr. Salma Haddad', specialty: 'Dermatology', patientId: 1, patientName: 'Amel Ben Salah', start: at(-9, 14), status: 'COMPLETED', reason: 'Skin rash' },
      { id: 3, doctorId: 3, doctorName: 'Dr. Youssef Ben Amor', specialty: 'Pediatrics', patientId: 1, patientName: 'Amel Ben Salah', start: at(-20, 9, 30), status: 'CANCELLED', reason: 'Vaccination' },
      { id: 4, doctorId: 1, doctorName: 'Dr. Karim Trabelsi', specialty: 'Cardiology', patientId: 2, patientName: 'Mohamed Gharbi', start: at(1, 9), status: 'SCHEDULED', reason: 'Chest pain follow-up' },
      { id: 5, doctorId: 1, doctorName: 'Dr. Karim Trabelsi', specialty: 'Cardiology', patientId: 3, patientName: 'Sarra Jlassi', start: at(1, 11, 30), status: 'SCHEDULED', reason: 'Blood pressure review' },
      { id: 6, doctorId: 1, doctorName: 'Dr. Karim Trabelsi', specialty: 'Cardiology', patientId: 4, patientName: 'Yassine Mejri', start: at(3, 14, 30), status: 'SCHEDULED', reason: 'ECG results' },
      { id: 7, doctorId: 1, doctorName: 'Dr. Karim Trabelsi', specialty: 'Cardiology', patientId: 5, patientName: 'Rim Ayari', start: at(-4, 10), status: 'COMPLETED', reason: 'Medication review' }
    ];
  }
}
