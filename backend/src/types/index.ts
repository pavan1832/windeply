export type DeploymentStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type UserRole = 'admin' | 'operator';

export interface Deployment {
  id: string;
  machine_id: string;
  template_id: string;
  status: DeploymentStatus;
  current_step: number;
  total_steps: number;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  created_by: string;
  configuration_profile: string;
  error_message: string | null;
}

export interface DeploymentLog {
  id: string;
  deployment_id: string;
  level: LogLevel;
  message: string;
  step_name: string | null;
  script_name: string | null;
  output: string | null;
  created_at: Date;
}

export interface DeploymentTemplate {
  id: string;
  name: string;
  description: string;
  software_list: string[];
  security_config: Record<string, unknown>;
  scripts: string[];
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface Machine {
  id: string;
  name: string;
  ip_address: string | null;
  os_version: string | null;
  status: 'online' | 'offline' | 'deploying' | 'unknown';
  last_seen: Date | null;
  created_at: Date;
  department: string | null;
  assigned_to: string | null;
}

export interface AutomationScript {
  id: string;
  name: string;
  filename: string;
  description: string;
  category: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface DeploymentStep {
  step: number;
  name: string;
  description: string;
  script: string | null;
  duration_ms: number;
}

export const DEPLOYMENT_STEPS: DeploymentStep[] = [
  { step: 1, name: 'Initialize Deployment', description: 'Preparing deployment environment and validating configuration', script: 'system_health_check.ps1', duration_ms: 2000 },
  { step: 2, name: 'Apply OS Image Configuration', description: 'Configuring OS baseline settings and applying image parameters', script: null, duration_ms: 4000 },
  { step: 3, name: 'Install Required Software', description: 'Installing software packages defined in deployment template', script: 'install_packages.ps1', duration_ms: 6000 },
  { step: 4, name: 'Apply Security Policies', description: 'Enforcing firewall rules, GPO policies, and security baselines', script: 'configure_security.ps1', duration_ms: 3000 },
  { step: 5, name: 'Finalize Configuration', description: 'Completing setup, running final checks and generating deployment report', script: 'generate_report.ps1', duration_ms: 2000 },
];
