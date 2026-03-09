# WinDeply — Windows OS Deployment Automation Platform

> Enterprise-grade platform for automating, monitoring, and managing Windows OS deployments at scale.

---

## Overview

**WinDeply** is a full-stack DevOps platform built to simulate and manage enterprise Windows OS deployment automation. It enables IT operations teams to define deployment templates, execute automated configuration workflows, monitor deployment status in real time, and maintain detailed audit logs across all managed endpoints.

The system follows real-world patterns used in enterprise environments — from initial OS image application to final security hardening — with a professional terminal-style dashboard built for operations engineers.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│              FRONTEND DASHBOARD (Next.js)            │
│   Dashboard · Jobs · Logs · Templates · Machines     │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/REST
┌─────────────────────▼───────────────────────────────┐
│              REST API (Node.js + Express)             │
│   /api/v1/deployments · /logs · /templates           │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│             AUTOMATION CONTROLLER                     │
│   Deployment Engine · Step Executor · Log Writer     │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│          POWERSHELL AUTOMATION SCRIPTS               │
│   install_packages.ps1 · configure_security.ps1      │
│   system_health_check.ps1 · generate_report.ps1      │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│             PostgreSQL DATABASE                       │
│   deployments · deployment_logs · machines           │
│   deployment_templates · automation_scripts          │
└─────────────────────────────────────────────────────┘
```

---

## Features

### Deployment Dashboard
- Real-time stats: total, successful, failed, active, pending
- Live deployment progress visualization
- Machine fleet status pie chart
- Area chart for deployment history
- Activity log feed with auto-refresh

### Deployment Job Manager
- Create deployment jobs by selecting a machine + template
- Execute, cancel, and monitor jobs
- Per-step progress tracking with named stages
- Error reporting with full stack trace capture

### 5-Step Deployment Workflow
| Step | Name | Description |
|------|------|-------------|
| 1 | Initialize Deployment | System health check & env validation |
| 2 | Apply OS Image Config | Baseline OS configuration |
| 3 | Install Software | Package installation per template |
| 4 | Apply Security Policies | Firewall rules, GPO, BitLocker |
| 5 | Finalize Configuration | Report generation & handoff |

### Deployment Templates
- Create reusable deployment blueprints
- Define software packages, security config, and scripts
- Developer Machine, Data Science Workstation, Standard Office presets

### Audit Logs
- Full timestamped log trail per deployment
- Severity levels: `INFO`, `WARN`, `ERROR`, `DEBUG`
- Live log viewer with search and filter
- Script output capture per step

### Machine Registry
- Register and track endpoints by name, IP, department
- Real-time status: `online`, `offline`, `deploying`, `unknown`
- Deployment history per machine
- Last-seen timestamps

### PowerShell Automation
- `install_packages.ps1` — Package installation with registry
- `configure_security.ps1` — Firewall rules, UAC, BitLocker, GPO
- `system_health_check.ps1` — Hardware/OS readiness validation
- `generate_report.ps1` — Post-deployment audit report

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| State | Redux Toolkit |
| Charts | Recharts |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL 16 |
| Automation | PowerShell 7 scripts |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
windeply/
├── frontend/                     # Next.js frontend
│   └── src/
│       ├── app/                  # App router pages
│       │   ├── page.tsx          # Dashboard
│       │   ├── jobs/page.tsx     # Deployment jobs
│       │   ├── logs/page.tsx     # Audit logs
│       │   ├── templates/        # Templates management
│       │   └── machines/         # Machine registry
│       ├── components/
│       │   ├── ui/               # Shared UI components
│       │   └── layout/           # Sidebar, header
│       ├── store/                # Redux store + slices
│       └── lib/api.ts            # Typed API client
│
├── backend/                      # Express API
│   └── src/
│       ├── controllers/          # Route handlers
│       ├── routes/               # API route definitions
│       ├── services/             # Deployment engine
│       ├── db/                   # PostgreSQL pool + init
│       └── types/                # Shared TypeScript types
│
├── scripts/
│   └── powershell/               # Automation scripts
│       ├── install_packages.ps1
│       ├── configure_security.ps1
│       ├── system_health_check.ps1
│       └── generate_report.ps1
│
├── database/
│   └── schema.sql                # Database schema
│
├── .github/workflows/
│   └── ci-cd.yml                 # GitHub Actions pipeline
│
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local dev without Docker)
- PostgreSQL 16 (for local dev without Docker)

### Run with Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourorg/windeply.git
cd windeply

# Start all services
docker compose up --build

# Access the app:
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# API Health: http://localhost:4000/health
```

### Local Development

#### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev       # Starts on http://localhost:4000
```

#### Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
npm install
npm run dev       # Starts on http://localhost:3000
```

---

## REST API Reference

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Deployment stats + recent logs |

### Deployments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/deployments` | List all deployments |
| POST | `/api/v1/deployments` | Create deployment job |
| GET | `/api/v1/deployments/:id` | Get deployment by ID |
| POST | `/api/v1/deployments/:id/execute` | Start deployment |
| POST | `/api/v1/deployments/:id/cancel` | Cancel deployment |

### Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/logs` | Get all logs (searchable) |
| GET | `/api/v1/deployments/:id/logs` | Logs for deployment |

### Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/templates` | List all templates |
| POST | `/api/v1/templates` | Create template |
| GET | `/api/v1/templates/:id` | Get template |
| PUT | `/api/v1/templates/:id` | Update template |
| DELETE | `/api/v1/templates/:id` | Delete template |

### Machines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/machines` | List all machines |
| POST | `/api/v1/machines` | Register machine |
| PUT | `/api/v1/machines/:id` | Update machine |
| DELETE | `/api/v1/machines/:id` | Remove machine |

### Scripts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/scripts` | List automation scripts |

---

## Example API Requests

```bash
# Create a deployment job
curl -X POST http://localhost:4000/api/v1/deployments \
  -H "Content-Type: application/json" \
  -d '{"machine_id":"<uuid>","template_id":"<uuid>","configuration_profile":"developer"}'

# Execute a deployment
curl -X POST http://localhost:4000/api/v1/deployments/<id>/execute

# Fetch logs with search
curl "http://localhost:4000/api/v1/logs?search=security&level=info&limit=50"
```

---

## Cloud Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod

# Set environment variable:
# NEXT_PUBLIC_API_URL = https://your-render-app.onrender.com/api/v1
```

### Backend → Render

1. Create new **Web Service** on render.com
2. Set **Build Command**: `npm install && npm run build`
3. Set **Start Command**: `npm start`
4. Add environment variables from `.env.example`
5. Add PostgreSQL database via Render's managed DB service

---

## CI/CD Pipeline

The GitHub Actions workflow at `.github/workflows/ci-cd.yml` runs:

1. **Lint & TypeCheck** — Both frontend and backend
2. **Build Backend** — Compile TypeScript, upload artifact
3. **Build Frontend** — Next.js production build
4. **Docker Build & Push** — Images to GitHub Container Registry
5. **Deploy Backend** — Trigger Render deploy hook
6. **Deploy Frontend** — Push to Vercel production

Required secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RENDER_DEPLOY_HOOK_BACKEND`

---

## PowerShell Scripts

Scripts are located in `scripts/powershell/`. They are designed to run on target Windows machines and simulate the full deployment lifecycle.

```powershell
# Health check before deployment
.\system_health_check.ps1

# Install software packages
.\install_packages.ps1 -PackageList "git,vscode,nodejs" -Profile developer

# Apply security policies
.\configure_security.ps1 -Level hardened -EnableBitLocker
```

---

## Screenshots

> Dashboard, Jobs, Logs, Templates, and Machines pages with terminal-style dark UI.

---

## License

MIT — Built for enterprise Windows deployment automation.
