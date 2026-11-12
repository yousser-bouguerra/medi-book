export type Role = 'PATIENT' | 'DOCTOR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  doctorId?: number;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  city: string;
  rating: number;
  yearsExperience: number;
  bio: string;
  color: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  doctorId: number;
  doctorName: string;
  specialty: string;
  patientId: number;
  patientName: string;
  start: string;
  status: AppointmentStatus;
  reason: string;
}

export interface Slot {
  time: string;
  iso: string;
  available: boolean;
}
