# SIATI — Sistem Informasi Absensi & Cuti Karyawan

Aplikasi fullstack monorepo untuk mengelola absensi dan cuti karyawan.

## Tech Stack

- **Frontend**: React 19 + Vite + MUI 6 + Redux Toolkit
- **Backend**: Express.js + Knex.js + JWT
- **Database**: PostgreSQL (Neon)
- **Deployment**: Vercel

## Struktur Monorepo

```
siati/
├── client/          # React Frontend (Vite)
├── server/          # Express Backend
├── shared/          # Shared utilities & constants
├── api/             # Vercel serverless entry
├── vercel.json      # Vercel config
└── package.json     # Root (npm workspaces)
```

## Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL (local atau Neon)

### Install Dependencies

```bash
npm install
```

### Setup Environment

```bash
cp .env.example .env
# Edit .env dengan konfigurasi database dan JWT secret
```

### Run Database Migrations

```bash
npm run db:migrate
npm run db:seed
```

### Run Development

```bash
npm run dev
```

Frontend: http://localhost:3000
Backend API: http://localhost:5000

### Default Login

```
Email: admin@siati.com
Password: Admin@123
```

## Scripts

| Command | Deskripsi |
|---|---|
| `npm run dev` | Jalankan client & server bersamaan |
| `npm run dev:client` | Jalankan frontend saja |
| `npm run dev:server` | Jalankan backend saja |
| `npm run build` | Build frontend untuk production |
| `npm run db:migrate` | Jalankan migrasi database |
| `npm run db:seed` | Jalankan seed data |
| `npm run db:reset` | Reset database (rollback + migrate + seed) |

## License

MIT
