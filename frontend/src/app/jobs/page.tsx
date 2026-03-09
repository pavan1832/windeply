'use client';
import { useEffect, useState } from 'react';
import { api, Deployment, Machine, Template } from '../../lib/api';
import { PageHeader, StatusBadge, Button, DeploymentProgress, Spinner, EmptyState } from '../../components/ui';
import { formatDistanceToNow } from 'date-fns';

export default function JobsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [executing, setExecuting] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ machine_id: '', template_id: '', configuration_profile: 'standard', created_by: 'admin' });
  const [selectedDep, setSelectedDep] = useState<Deployment | null>(null);
  const [logs, setLogs] = useState<{ id: string; level: string; message: string; step_name: string | null; created_at: string }[]>([]);
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const [deps, macs, tmps] = await Promise.all([
        api.getDeployments(params),
        api.getMachines(),
        api.getTemplates(),
      ]);
      setDeployments(deps);
      setMachines(macs);
      setTemplates(tmps);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); const i = setInterval(load, 4000); return () => clearInterval(i); }, [filterStatus]);

  const handleCreate = async () => {
    if (!form.machine_id || !form.template_id) return alert('Select machine and template');
    await api.createDeployment(form);
    setShowCreate(false);
    setForm({ machine_id: '', template_id: '', configuration_profile: 'standard', created_by: 'admin' });
    load();
  };

  const handleExecute = async (id: string) => {
    setExecuting(prev => new Set(prev).add(id));
    try { await api.executeDeployment(id); } catch(e: unknown) { alert(e instanceof Error ? e.message : 'Error'); }
    setExecuting(prev => { const n = new Set(prev); n.delete(id); return n; });
    load();
  };

  const handleViewLogs = async (dep: Deployment) => {
    setSelectedDep(dep);
    const l = await api.getDeploymentLogs(dep.id);
    setLogs(l as typeof logs);
  };

  const handleCancel = async (id: string) => {
    await api.cancelDeployment(id);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader
        title="Deployment Jobs"
        subtitle={`${deployments.length} total jobs`}
        action={
          <Button onClick={() => setShowCreate(true)}>+ New Deployment</Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'pending', 'running', 'success', 'failed', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 text-xs font-mono rounded border transition-all ${
              filterStatus === s
                ? 'border-terminal-accent text-terminal-accent bg-terminal-accent/10'
                : 'border-terminal-border text-terminal-muted hover:border-terminal-muted'
            }`}
          >
            {s || 'all'}
          </button>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="terminal-card w-full max-w-md p-6">
            <div className="text-sm font-mono text-terminal-accent mb-5">// NEW DEPLOYMENT JOB</div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-terminal-muted uppercase mb-1">Target Machine</label>
                <select
                  value={form.machine_id}
                  onChange={e => setForm(f => ({ ...f, machine_id: e.target.value }))}
                  className="w-full bg-black/40 border border-terminal-border text-terminal-text rounded p-2 font-mono text-sm"
                >
                  <option value="">Select machine...</option>
                  {machines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.status})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-terminal-muted uppercase mb-1">Deployment Template</label>
                <select
                  value={form.template_id}
                  onChange={e => setForm(f => ({ ...f, template_id: e.target.value }))}
                  className="w-full bg-black/40 border border-terminal-border text-terminal-text rounded p-2 font-mono text-sm"
                >
                  <option value="">Select template...</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-terminal-muted uppercase mb-1">Configuration Profile</label>
                <select
                  value={form.configuration_profile}
                  onChange={e => setForm(f => ({ ...f, configuration_profile: e.target.value }))}
                  className="w-full bg-black/40 border border-terminal-border text-terminal-text rounded p-2 font-mono text-sm"
                >
                  {['standard', 'hardened', 'minimal', 'developer'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleCreate}>Create Job</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Viewer Modal */}
      {selectedDep && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="terminal-card w-full max-w-3xl p-5 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-mono text-terminal-accent">// DEPLOYMENT LOGS</div>
                <div className="text-white font-bold mt-1">{selectedDep.machine_name}</div>
              </div>
              <button onClick={() => setSelectedDep(null)} className="text-terminal-muted hover:text-white text-lg">✕</button>
            </div>
            <div className="log-terminal flex-1 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-terminal-muted">No logs available yet.</div>
              ) : logs.map(log => (
                <div key={log.id} className="flex gap-2 py-0.5">
                  <span className="text-terminal-muted shrink-0 text-xs">{new Date(log.created_at).toLocaleTimeString()}</span>
                  <span className={`shrink-0 font-bold uppercase text-xs ${
                    log.level === 'error' ? 'text-terminal-red' :
                    log.level === 'warn' ? 'text-terminal-yellow' :
                    log.level === 'debug' ? 'text-terminal-muted' : 'text-terminal-accent'
                  }`}>[{log.level}]</span>
                  <span className="text-terminal-text">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deployments Grid */}
      {deployments.length === 0 ? (
        <EmptyState message="No deployment jobs found. Create one to get started." />
      ) : (
        <div className="grid gap-4">
          {deployments.map(dep => (
            <div key={dep.id} className={`terminal-card p-4 transition-all ${dep.status === 'running' ? 'running-border' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-mono font-bold text-white">{dep.machine_name}</div>
                    <div className="text-terminal-muted text-xs font-mono">{dep.id.slice(0, 8)}... · {dep.configuration_profile}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={dep.status} />
                  <Button size="sm" variant="ghost" onClick={() => handleViewLogs(dep)}>Logs</Button>
                  {dep.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleExecute(dep.id)}
                      disabled={executing.has(dep.id)}
                    >
                      {executing.has(dep.id) ? 'Starting...' : '▶ Run'}
                    </Button>
                  )}
                  {(dep.status === 'pending' || dep.status === 'running') && (
                    <Button size="sm" variant="danger" onClick={() => handleCancel(dep.id)}>Cancel</Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-mono text-terminal-muted mb-3">
                <div><span className="text-terminal-muted">Template:</span> <span className="text-terminal-text">{dep.template_name}</span></div>
                <div><span className="text-terminal-muted">Created by:</span> <span className="text-terminal-text">{dep.created_by}</span></div>
                <div><span className="text-terminal-muted">Started:</span> <span className="text-terminal-text">{dep.started_at ? formatDistanceToNow(new Date(dep.started_at), { addSuffix: true }) : '—'}</span></div>
              </div>

              {(dep.status === 'running' || dep.status === 'success' || dep.status === 'failed') && (
                <DeploymentProgress current={dep.current_step} total={dep.total_steps} />
              )}

              {dep.error_message && (
                <div className="mt-2 bg-terminal-red/10 border border-terminal-red/20 rounded p-2 text-xs font-mono text-terminal-red">
                  ✗ {dep.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
