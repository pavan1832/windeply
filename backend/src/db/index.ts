import { Pool } from 'pg';

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'windeply',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'Pavan@183',
      }
);

export const initializeDatabase = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS machines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        ip_address VARCHAR(45),
        os_version VARCHAR(100),
        status VARCHAR(20) DEFAULT 'unknown' CHECK (status IN ('online', 'offline', 'deploying', 'unknown')),
        last_seen TIMESTAMPTZ,
        department VARCHAR(100),
        assigned_to VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS deployment_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        software_list JSONB DEFAULT '[]',
        security_config JSONB DEFAULT '{}',
        scripts JSONB DEFAULT '[]',
        created_by VARCHAR(100) DEFAULT 'system',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS automation_scripts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(100),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS deployments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        machine_id UUID REFERENCES machines(id),
        template_id UUID REFERENCES deployment_templates(id),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
        current_step INTEGER DEFAULT 0,
        total_steps INTEGER DEFAULT 5,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by VARCHAR(100) DEFAULT 'operator',
        configuration_profile VARCHAR(100) DEFAULT 'standard',
        error_message TEXT
      );

      CREATE TABLE IF NOT EXISTS deployment_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
        level VARCHAR(10) DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error', 'debug')),
        message TEXT NOT NULL,
        step_name VARCHAR(255),
        script_name VARCHAR(255),
        output TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
      CREATE INDEX IF NOT EXISTS idx_deployments_machine_id ON deployments(machine_id);
      CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);
      CREATE INDEX IF NOT EXISTS idx_deployment_logs_created_at ON deployment_logs(created_at DESC);
    `);

    // Seed default data
    await client.query(`
      INSERT INTO machines (name, ip_address, os_version, status, department, assigned_to) VALUES
        ('DESKTOP-ALPHA', '192.168.1.101', 'Windows 11 Pro 23H2', 'online', 'Engineering', 'John Smith'),
        ('DESKTOP-BETA', '192.168.1.102', 'Windows 10 Enterprise', 'offline', 'Data Science', 'Sarah Lee'),
        ('LAPTOP-GAMMA', '192.168.1.103', NULL, 'unknown', 'Operations', NULL),
        ('WORKSTATION-DELTA', '192.168.1.104', 'Windows 11 Pro 22H2', 'deploying', 'Finance', 'Mike Chen'),
        ('SERVER-EPSILON', '192.168.1.200', 'Windows Server 2022', 'online', 'IT', 'Admin')
      ON CONFLICT (name) DO NOTHING;

      INSERT INTO deployment_templates (name, description, software_list, security_config, scripts, created_by) VALUES
        (
          'Developer Machine',
          'Full development workstation setup with IDEs, version control, and build tools',
          '["Visual Studio Code", "Git", "Node.js", "Docker Desktop", "Python 3.11", "Windows Terminal", "PowerShell 7"]',
          '{"firewall": "strict", "bitlocker": true, "uac": "high", "defender": true}',
          '["install_packages.ps1", "configure_security.ps1", "system_health_check.ps1"]',
          'admin'
        ),
        (
          'Data Science Workstation',
          'High-performance workstation configured for ML/AI workloads with Python data stack',
          '["Python 3.11", "Anaconda", "Jupyter Lab", "R Studio", "CUDA Toolkit", "Visual Studio Code", "Git"]',
          '{"firewall": "standard", "bitlocker": true, "uac": "medium", "defender": true}',
          '["install_packages.ps1", "configure_security.ps1"]',
          'admin'
        ),
        (
          'Standard Office Laptop',
          'Standard corporate laptop configuration with productivity and security essentials',
          '["Microsoft 365", "Chrome", "Zoom", "Slack", "7-Zip", "VPN Client", "Antivirus"]',
          '{"firewall": "standard", "bitlocker": true, "uac": "medium", "defender": true}',
          '["install_packages.ps1", "configure_security.ps1", "system_health_check.ps1"]',
          'admin'
        )
      ON CONFLICT DO NOTHING;

      INSERT INTO automation_scripts (name, filename, description, category, content) VALUES
        (
          'Install Packages',
          'install_packages.ps1',
          'Installs software packages defined in the deployment template',
          'installation',
          '# install_packages.ps1\r\n# Windows OS Deployment Platform - Package Installer\r\nParam([string]$PackageList = "")\r\nWrite-Host "[INFO] Starting package installation..." -ForegroundColor Cyan\r\n$packages = $PackageList -split ","\r\nforeach ($pkg in $packages) {\r\n    Write-Host "[INSTALL] Installing: $pkg" -ForegroundColor Yellow\r\n    Start-Sleep -Milliseconds 500\r\n    Write-Host "[OK] $pkg installed successfully" -ForegroundColor Green\r\n}\r\nWrite-Host "[INFO] Package installation complete" -ForegroundColor Cyan'
        ),
        (
          'Configure Security',
          'configure_security.ps1',
          'Applies firewall rules, GPO policies and security baselines',
          'security',
          '# configure_security.ps1\r\n# Windows OS Deployment Platform - Security Configurator\r\nWrite-Host "[INFO] Applying security configuration..." -ForegroundColor Cyan\r\nWrite-Host "[SEC] Enabling Windows Firewall..." -ForegroundColor Yellow\r\nStart-Sleep -Milliseconds 300\r\nWrite-Host "[SEC] Configuring BitLocker..." -ForegroundColor Yellow\r\nStart-Sleep -Milliseconds 300\r\nWrite-Host "[SEC] Applying GPO policies..." -ForegroundColor Yellow\r\nStart-Sleep -Milliseconds 300\r\nWrite-Host "[OK] Security configuration applied" -ForegroundColor Green'
        ),
        (
          'System Health Check',
          'system_health_check.ps1',
          'Validates system health and readiness for deployment',
          'diagnostic',
          '# system_health_check.ps1\r\n# Windows OS Deployment Platform - Health Check\r\nWrite-Host "[INFO] Running system health check..." -ForegroundColor Cyan\r\n$cpu = Get-WmiObject Win32_Processor | Select-Object -ExpandProperty LoadPercentage\r\nWrite-Host "[CHECK] CPU Load: $cpu%" -ForegroundColor Yellow\r\n$mem = Get-WmiObject Win32_OperatingSystem\r\nWrite-Host "[CHECK] Memory check passed" -ForegroundColor Green\r\nWrite-Host "[OK] System health check complete" -ForegroundColor Green'
        )
      ON CONFLICT (filename) DO NOTHING;
    `);

    console.log('✅ Database initialized successfully');
  } finally {
    client.release();
  }
};

export default pool;
