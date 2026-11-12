# MediBook

![CI](https://github.com/yosseer12/medi-book/actions/workflows/ci.yml/badge.svg)

Clinic appointment management web app. Patients find a doctor, pick a time slot and manage their visits. Doctors follow their agenda and update appointment statuses.

> This repository contains the **Angular 18 front end**. It currently runs on an in-memory data layer, designed to be replaced by the ASP.NET Core REST API.

## Screenshots

| Login | Doctors | Booking |
|-------|---------|---------|
| <img src="C:\Users\yosr bouguerra\Downloads\medibook-web\medibook-web\docs\login.png" width="300"> | <img src="docs/doctors.png" width="300"> | <img src="docs/booking.png" width="300"> |

## Features
- JWT-style authentication with role-based routing (patient / doctor), route guards and an HTTP interceptor
- **Patient**: dashboard, doctor search and filters, real-time slot availability, booking, cancellation
- **Doctor**: agenda with daily stats, complete or cancel appointments
- Standalone components, signals, new control flow (`@if` / `@for`), lazy-loaded routes, reactive forms
- Responsive UI, loading skeletons, toast notifications, visible focus states
- Docker + nginx image and GitHub Actions CI

## Tech stack
Angular 18, TypeScript, RxJS, HTML5, CSS3, Docker, nginx, GitHub Actions

## Demo accounts
| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Patient | patient@medibook.tn  | Patient123! |
| Doctor  | doctor@medibook.tn   | Doctor123!  |

## Getting started
```bash
npm install
npm start        # http://localhost:4200
```

### With Docker
```bash
docker build -t medibook-web .
docker run -p 8080:80 medibook-web   # http://localhost:8080
```

## Project structure
```
src/app
├── core      models, auth (signals), guards, interceptor, API service, toasts
├── layout    app shell with role-based navigation
└── pages     login, dashboard, doctors, booking, my appointments, doctor agenda
```

## Roadmap
- [ ] Connect the ASP.NET Core REST API (EF Core, PostgreSQL, JWT)
- [ ] Unit tests for services and components
- [ ] React version of the front end
- [ ] Live demo deployment

## Author
**Yousser Bouguerra**: Full-Stack Developer (Angular, React, ASP.NET Core, Node.js)

- GitHub: [@yosseer12](https://github.com/yosseer12)
- LinkedIn: [Yousser Bouguerra](https://www.linkedin.com/in/yousser-bouguerra-b22186200/)
