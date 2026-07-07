# ClinicFlow — SaaS REST API za privatne poliklinike (Hrvatska)

[![PHP](https://img.shields.io/badge/PHP-8.4-7C3AED?logo=php)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel)](https://laravel.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)
[![CI/CD](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=github-actions)](https://github.com/features/actions)
[![PHPUnit](https://img.shields.io/badge/PHPUnit-Feature_Tests-366488?logo=php)](https://phpunit.de)

**ClinicFlow** je enterprise-grade SaaS REST API za upravljanje privatnim poliklinikama i ordinacijama u Hrvatskoj. Demonstrira naprednu PHP arhitekturu s fokusom na SOLID principe, multi-tenancy i sigurnost.

---

## 📋 Moduli

| Modul | Endpoints | Opis |
|---|---|---|
| 🔐 Autentifikacija | 7 | Registracija, prijava, odjava, profil, 2FA TOTP |
| 👥 Pacijenti | 6 | CRUD + timeline + soft delete |
| 👨‍⚕️ Doktori | 6 | CRUD + provjera slobodnih termina |
| 📅 Termini | 7 | CRUD + kalendar + termini danas |
| 📋 Medicinski kartoni | 6 | SOAP metodologija + digitalni potpis |
| 💊 Recepti | 6 | CRUD + PDF generiranje |
| 🔬 Lab nalazi | 5 | CRUD + stavke |
| 🏥 Fakture | 8 | CRUD + PDF + mark-paid + summary |
| 📊 Dashboard | 1 | Statistike klinike |
| 📈 Izvještaji | 3 | Revenue + doktori + CSV izvoz |
| 🔔 Obavijesti | 4 | Lista + unread count + mark read |
| 👤 Korisnici | 5 | CRUD + RBAC |
| 🏷️ Specijalizacije | 5 | CRUD |

---

## 🏗️ Arhitektura i dizajn uzorci

| Princip/Uzorak | Implementacija |
|---|---|
| **SRP** | Kontroleri delegiraju logiku servisima |
| **OCP** | Proširivanje bez mijenjanja postojećih servisa |
| **Service Layer** | `AuthService`, `AppointmentService`, `InvoiceService`... |
| **Multi-tenancy** | `clinic_id` na svim tabelama + Eloquent Global Scopes |
| **RBAC** | Spatie Laravel Permission (4 uloge) |
| **Audit Log** | Spatie Activitylog na ključnim modelima |
| **API Filtering** | Spatie Query Builder |

---

## 📦 Tech stack

- **PHP 8.4** + **Laravel 11** (bootstrap/app.php, bez Kernel.php)
- **PostgreSQL 16** (Replit ugrađena baza)
- **Laravel Sanctum** — Bearer token autentifikacija
- **Spatie Permission** — RBAC (admin, doctor, receptionist, nurse)
- **Spatie Activitylog** — Audit trail
- **Spatie Query Builder** — Filtriranje i sortiranje
- **DomPDF** — PDF generiranje (fakture, recepti)
- **Google2FA** — TOTP dvofaktorska autentifikacija
- **League/CSV** — CSV izvoz izvještaja
- **Docker Compose** — 6 servisa
- **GitHub Actions** — CI + CD

---

## 🚀 Instalacija

### Lokalno (bez Dockera)

```bash
git clone <repo>
cd clinicflow
composer install
cp .env.example .env
php artisan key:generate

# Konfigurirajte DB u .env, zatim:
php artisan migrate
php artisan db:seed
php artisan serve --port=8091
```

### Docker

```bash
cp .env.example .env
docker-compose up -d
docker-compose exec app php artisan migrate --seed
```

Aplikacija dostupna na: **http://localhost:8091**

---

## 🌐 API rute (pregled)

```
POST   /api/register
POST   /api/login
POST   /api/logout
GET    /api/me
POST   /api/2fa/setup | verify | disable

GET    /api/dashboard

GET|POST         /api/patients
GET|PUT|DELETE   /api/patients/{id}
GET              /api/patients/{id}/timeline

GET|POST         /api/doctors
GET              /api/doctors/{id}/availability
GET|POST         /api/appointments
GET              /api/appointments/today
GET              /api/appointments/calendar

POST   /api/medical-records/{id}/sign
GET    /api/prescriptions/{id}/pdf
GET    /api/invoices/{id}/pdf
POST   /api/invoices/{id}/mark-paid
GET    /api/invoices/summary

GET    /api/reports/revenue
GET    /api/reports/doctors
GET    /api/reports/export

GET    /api/notifications/unread-count
POST   /api/notifications/mark-all-read
```

> `php artisan route:list --path=api` vraća 55+ ruta.

---

## 🔑 Demo pristup

| Polje | Vrijednost |
|---|---|
| Email | `admin@demo-klinika.hr` |
| Lozinka | `demo1234` |
| Klinika | Demo Poliklinika Zagreb |

---

## 📝 Curl primjeri

```bash
# Registracija
curl -X POST http://localhost:8091/api/register \
  -H "Content-Type: application/json" \
  -d '{"clinic_name":"Moja Klinika Zagreb","first_name":"Ana","last_name":"Novak","email":"ana@klinika.hr","password":"tajna1234","password_confirmation":"tajna1234"}'

# Prijava
curl -X POST http://localhost:8091/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo-klinika.hr","password":"demo1234"}'

# Dashboard (s tokenom)
curl http://localhost:8091/api/dashboard \
  -H "Authorization: Bearer <TOKEN>"

# Kreiranje pacijenta
curl -X POST http://localhost:8091/api/patients \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Luka","last_name":"Horvat","dob":"1990-03-15","gender":"male","phone":"+385911234567"}'

# Zakazivanje termina
curl -X POST http://localhost:8091/api/appointments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":1,"doctor_id":1,"starts_at":"2026-08-01T10:00:00","type":"consultation"}'

# PDF fakture
curl http://localhost:8091/api/invoices/1/pdf \
  -H "Authorization: Bearer <TOKEN>" \
  --output faktura.pdf
```

---

## 🧪 Testovi

```bash
php artisan test
# ili
./vendor/bin/phpunit --coverage-html coverage/
```

Feature testovi: **AuthTest**, **PatientTest**, **AppointmentTest**

---

## 🐳 Docker servisi

| Servis | Image | Port |
|---|---|---|
| app | PHP 8.4-FPM | interno |
| webserver | Nginx Alpine | **8091:80** |
| db | PostgreSQL 16 | interno |
| redis | Redis 7 | interno |
| queue | PHP (worker) | interno |
| scheduler | PHP (cron) | interno |

---

## 📄 Licenca

MIT © 2026 ClinicFlow — Portfolio projekt
