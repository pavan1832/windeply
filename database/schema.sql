-- WinDeply Database Schema
-- PostgreSQL 16+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- MACHINES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS machines (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(255) NOT NULL UNIQUE,
    ip_address   VARCHAR(45),
    os_version   VARCHAR(100),
    status       VARCHAR(20) DEFAULT 'unknown'
                 CHECK (status IN ('online', 'offline', 'deploying', 'unknown')),
    last_seen    TIMESTAMPTZ,
    department   VARCHAR(100),
    assigned_to  VARCHAR(100),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- DEPLOYMENT TEMPLATES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deployment_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    software_list   JSONB DEFAULT '[]',
    security_config JSONB DEFAULT '{}',
    scripts         JSONB DEFAULT '[]',
    created_by      VARCHAR(100) DEFAULT 'system',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- AUTOMATION SCRIPTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automation_scripts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    filename    VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category    VARCHAR(100),
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- DEPLOYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deployments (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id            UUID REFERENCES machines(id),
    template_id           UUID REFERENCES deployment_templates(id),
    status                VARCHAR(20) DEFAULT 'pending'
                          CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
    current_step          INTEGER DEFAULT 0,
    total_steps           INTEGER DEFAULT 5,
    started_at            TIMESTAMPTZ,
    completed_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    created_by            VARCHAR(100) DEFAULT 'operator',
    configuration_profile VARCHAR(100) DEFAULT 'standard',
    error_message         TEXT
);

-- ─────────────────────────────────────────────
-- DEPLOYMENT LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deployment_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
    level         VARCHAR(10) DEFAULT 'info'
                  CHECK (level IN ('info', 'warn', 'error', 'debug')),
    message       TEXT NOT NULL,
    step_name     VARCHAR(255),
    script_name   VARCHAR(255),
    output        TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_deployments_status       ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_machine_id   ON deployments(machine_id);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at   ON deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_deployment_id       ON deployment_logs(deployment_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at          ON deployment_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level               ON deployment_logs(level);
CREATE INDEX IF NOT EXISTS idx_machines_status          ON machines(status);
