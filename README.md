# WinDeply — Windows OS Deployment Automation Platform

> Enterprise-grade platform for automating, monitoring, and managing Windows OS deployments at scale.

**Live Demo:**
- Frontend: https://windeply.vercel.app
- Backend API: https://windeply-1.onrender.com/health

---

## Overview

WinDeply is a full-stack DevOps platform that orchestrates Windows OS deployment workflows. IT operations teams can define reusable deployment templates, execute automated configuration workflows step-by-step, monitor deployment status in real time, and maintain a complete audit log of every action taken on every machine.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│         FRONTEND DASHBOARD  (Next.js / Vercel)      │
│   Dashboard · Jobs · Logs · Templates · Machines    │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP REST / JSON
┌─────────────────────▼───────────────────────────────┐
│         REST API  (Node.js + Express / Render)       │
│   /api/v1/deployments · /logs · /templates · more   │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│         AUTOMATION CONTROLLER                        │
│   Deployment Engine · Step Executor · Log Writer    │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│         POWERSHELL SCRIPTS                           │
│   install_packages · configure_security · health    │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│         PostgreSQL DATABASE  (Neon)                  │
│   deployments · logs · templates · machines         │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| State | Redux Toolkit |
| Charts | Recharts |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL 16 (Neon cloud) |
| Automation | PowerShell 7 scripts |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Hosting | Vercel (frontend) · Render (backend) · Neon (database) |

---

## Features

- **Deployment Dashboard** — live stat cards, area chart, pie chart, active job progress, log feed
- **Deployment Job Manager** — create/execute/cancel jobs, 5-step progress tracking, error reporting
- **Audit Log Viewer** — terminal-style live log viewer with search, level filter, and line numbers
- **Template Manager** — create reusable blueprints with software lists, scripts, and security config
- **Machine Registry** — register and track endpoints with status, department, and deployment history
- **PowerShell Engine** — 3 scripts: package install, security hardening, system health check
- **Real-time polling** — dashboard auto-refreshes every 3–6 seconds during active deployments

---

## 5-Step Deployment Workflow

| Step | Name | Script |
|------|------|--------|
| 1 | Initialize Deployment | `system_health_check.ps1` |
| 2 | Apply OS Image Config | — |
| 3 | Install Required Software | `install_packages.ps1` |
| 4 | Apply Security Policies | `configure_security.ps1` |
| 5 | Finalize Configuration | `generate_report.ps1` |

---

## Project Structure

```
windeply/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── jobs/page.tsx         # Deployment jobs
│   │   │   ├── logs/page.tsx         # Audit log viewer
│   │   │   ├── templates/page.tsx    # Templates CRUD
│   │   │   ├── machines/page.tsx     # Machine registry
│   │   │   ├── layout.tsx            # Root layout + providers
│   │   │   └── globals.css           # Terminal theme CSS
│   │   ├── components/
│   │   │   ├── ui/index.tsx          # Shared UI components
│   │   │   ├── layout/Sidebar.tsx    # Navigation sidebar
│   │   │   └── Providers.tsx         # Redux provider
│   │   ├── store/
│   │   │   ├── index.ts              # Redux store config
│   │   │   └── slices/               # dashboardSlice, deploymentsSlice
│   │   └── lib/api.ts                # Typed API client
│   ├── package.json
│   ├── tsconfig.json                 # baseUrl + @/ alias
│   ├── tailwind.config.js
│   └── .env.local
│
├── backend/
│   ├── src/
│   │   ├── controllers/              # 5 resource controllers
│   │   ├── routes/index.ts           # All API routes
│   │   ├── services/deploymentService.ts  # Async automation engine
│   │   ├── db/index.ts               # Pool + DB init + seed data
│   │   ├── types/index.ts            # Shared TypeScript types
│   │   └── index.ts                  # Express app entry point
│   ├── package.json                  # @types/* in dependencies
│   ├── tsconfig.json                 # types: [node]
│   └── .env
│
├── scripts/powershell/
│   ├── install_packages.ps1
│   ├── configure_security.ps1
│   └── system_health_check.ps1
│
├── database/schema.sql
├── docker-compose.yml
├── .github/workflows/ci-cd.yml
└── README.md
```

---

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### Run with Docker (recommended)

```bash
git clone https://github.com/pavan1832/windeply.git
cd windeply
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
# Health:   http://localhost:4000/health
```

### Run manually

**Backend**
```bash
cd backend
cp .env.example .env        # edit DB credentials
npm install
npm run dev                  # http://localhost:4000
```

**Frontend**
```bash
cd frontend
# create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
npm install
npm run dev                  # http://localhost:3000
```

---

## Environment Variables

### Backend `.env`
```
PORT=4000
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require   # for Neon/cloud
DB_HOST=localhost       # for local dev without DATABASE_URL
DB_PORT=5432
DB_NAME=windeply
DB_USER=postgres
DB_PASSWORD=postgres
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

> **Note:** If `DATABASE_URL` is set, it takes priority over individual `DB_*` variables. Use `DATABASE_URL` for Neon/Render cloud deployment.

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## Cloud Deployment

### Database — Neon
1. Create project at [neon.tech](https://neon.tech)
2. Copy the connection string: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

### Backend — Render
1. New Web Service → connect GitHub repo
2. Root directory: `backend`
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<your Neon connection string>
   FRONTEND_URL=https://your-app.vercel.app
   ```

### Frontend — Vercel
1. Import GitHub repo at [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Framework: Next.js (auto-detected)
4. Environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api/v1
   ```

---

## REST API Reference

### Base URL
```
Production: https://windeply-1.onrender.com/api/v1
Local:      http://localhost:4000/api/v1
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Stats, recent logs, machine status counts |
| GET | `/deployments` | List deployments (filter: `?status=running`) |
| POST | `/deployments` | Create deployment job |
| GET | `/deployments/:id` | Get deployment by ID |
| POST | `/deployments/:id/execute` | Start deployment workflow |
| POST | `/deployments/:id/cancel` | Cancel job |
| GET | `/logs` | All logs (`?search=&level=error&limit=200`) |
| GET | `/deployments/:id/logs` | Logs for a specific deployment |
| GET | `/templates` | List all templates |
| POST | `/templates` | Create template |
| PUT | `/templates/:id` | Update template |
| DELETE | `/templates/:id` | Delete template |
| GET | `/machines` | List machines with deployment stats |
| POST | `/machines` | Register machine |
| PUT | `/machines/:id` | Update machine |
| DELETE | `/machines/:id` | Remove machine |
| GET | `/scripts` | List automation scripts |

---

## CI/CD Pipeline

`.github/workflows/ci-cd.yml` runs on every push to `main`:

```
push to main
    │
    ├── lint (frontend + backend)
    ├── build-backend  → uploads dist/
    ├── build-frontend → uploads .next/
    ├── docker         → push to GHCR
    ├── deploy-backend → Render deploy hook
    └── deploy-frontend → Vercel production
```

Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RENDER_DEPLOY_HOOK_BACKEND`

---

## Bugs Fixed During Development

| # | Issue | Fix |
|---|-------|-----|
| 1 | Malformed `{frontend,...}` folder in zip | Removed phantom folder from brace expansion bug |
| 2 | `Module not found: ../../lib/api` | Changed all imports to `@/` alias, added `baseUrl` to tsconfig |
| 3 | Backend: password auth failed | Added missing `.env` and `.env.local` files |
| 4 | Render: `Cannot find declaration file for express` | Moved `@types/*` and `typescript` from `devDependencies` to `dependencies` |
| 5 | Render: `Cannot find name 'process'` | Added `"types": ["node"]` to `backend/tsconfig.json` |
| 6 | `DATABASE_URL` not supported for Neon | Updated `db/index.ts` to detect `DATABASE_URL` and use SSL connection string |

---

## PowerShell Scripts

```powershell
# System health check (12 checks)
.\system_health_check.ps1

# Install packages
.\install_packages.ps1 -PackageList "git,vscode,nodejs" -Profile developer

# Apply security hardening (CIS Level 1)
.\configure_security.ps1 -Level hardened -EnableBitLocker

# Dry run (no changes applied)
.\configure_security.ps1 -Level hardened -WhatIf
```

---

## License

MIT — Built for enterprise Windows deployment automation.
