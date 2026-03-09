const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),

  // Deployments
  getDeployments: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Deployment[]>(`/deployments${qs}`);
  },
  getDeployment: (id: string) => request<Deployment>(`/deployments/${id}`),
  createDeployment: (data: CreateDeploymentPayload) =>
    request<Deployment>('/deployments', { method: 'POST', body: JSON.stringify(data) }),
  executeDeployment: (id: string) =>
    request<{ message: string }>(`/deployments/${id}/execute`, { method: 'POST' }),
  cancelDeployment: (id: string) =>
    request<Deployment>(`/deployments/${id}/cancel`, { method: 'POST' }),

  // Logs
  getLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Log[]>(`/logs${qs}`);
  },
  getDeploymentLogs: (deploymentId: string) =>
    request<Log[]>(`/deployments/${deploymentId}/logs`),

  // Templates
  getTemplates: () => request<Template[]>('/templates'),
  getTemplate: (id: string) => request<Template>(`/templates/${id}`),
  createTemplate: (data: Partial<Template>) =>
    request<Template>('/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id: string, data: Partial<Template>) =>
    request<Template>(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id: string) =>
    request<{ message: string }>(`/templates/${id}`, { method: 'DELETE' }),

  // Machines
  getMachines: () => request<Machine[]>('/machines'),
  createMachine: (data: Partial<Machine>) =>
    request<Machine>('/machines', { method: 'POST', body: JSON.stringify(data) }),
  updateMachine: (id: string, data: Partial<Machine>) =>
    request<Machine>(`/machines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMachine: (id: string) =>
    request<{ message: string }>(`/machines/${id}`, { method: 'DELETE' }),

  // Scripts
  getScripts: () => request<Script[]>('/scripts'),
};

// Types
export interface DashboardStats {
  deployments: { total: string; successful: string; failed: string; active: string; pending: string };
  recent_logs: Log[];
  machines: { status: string; count: string }[];
}

export interface Deployment {
  id: string;
  machine_id: string;
  machine_name: string;
  template_id: string;
  template_name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  current_step: number;
  total_steps: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  created_by: string;
  configuration_profile: string;
  error_message: string | null;
}

export interface CreateDeploymentPayload {
  machine_id: string;
  template_id: string;
  configuration_profile?: string;
  created_by?: string;
}

export interface Log {
  id: string;
  deployment_id: string;
  machine_name?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  step_name: string | null;
  script_name: string | null;
  output: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  software_list: string[];
  security_config: Record<string, unknown>;
  scripts: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: string;
  name: string;
  ip_address: string | null;
  os_version: string | null;
  status: 'online' | 'offline' | 'deploying' | 'unknown';
  last_seen: string | null;
  department: string | null;
  assigned_to: string | null;
  created_at: string;
  total_deployments?: number;
  successful_deployments?: number;
}

export interface Script {
  id: string;
  name: string;
  filename: string;
  description: string;
  category: string;
  content: string;
  created_at: string;
}
