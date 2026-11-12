import { Routes } from '@angular/router';
import { authGuard, homeGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', canActivate: [homeGuard], children: [] },
      {
        path: 'patient',
        canActivate: [roleGuard('PATIENT')],
        children: [
          { path: 'dashboard', loadComponent: () => import('./pages/patient-dashboard.component').then(m => m.PatientDashboardComponent) },
          { path: 'doctors', loadComponent: () => import('./pages/doctors.component').then(m => m.DoctorsComponent) },
          { path: 'doctors/:id', loadComponent: () => import('./pages/doctor-detail.component').then(m => m.DoctorDetailComponent) },
          { path: 'appointments', loadComponent: () => import('./pages/my-appointments.component').then(m => m.MyAppointmentsComponent) },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
      },
      {
        path: 'doctor',
        canActivate: [roleGuard('DOCTOR')],
        children: [
          { path: 'agenda', loadComponent: () => import('./pages/doctor-agenda.component').then(m => m.DoctorAgendaComponent) },
          { path: '', pathMatch: 'full', redirectTo: 'agenda' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
