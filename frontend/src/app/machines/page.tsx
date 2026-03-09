'use client';
import { useEffect, useState } from 'react';
import { api, Machine } from '../../lib/api';
import { PageHeader, StatusBadge, Button, Spinner, EmptyState } from '../../components/ui';
import { formatDistanceToNow } from 'date-fns';

const defaultForm = { name: '', ip_address: '', os_version: '', department: '', assigned_to: '' };

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    const data = await api.getMachines();
    setMachines(data);
    setLoading(false);
  };

  useEffect(() => { load(); const i = setInterval(load, 6000); return () => clearInterval(i); }, []);

  const handleCreate = async () => {
    if (!form.name) return alert('Machine name required');
    await api.createMachine(form);
    setShowCreate(false);
    setForm(defaultForm);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this machine?')) return;
    await api.deleteMachine(id);
    load();
  };

  const statusIcons: Record<string, string> = {
    online: '●', offline: '○', deploying: '◎', unknown: '◌',
  };

  if (loading) return <Spinner />;

  const stats = {
    online: machines.filter(m => m.status === 'online').length,
    offline: machines.filter(m => m.status === 'offline').length,
    deploying: machines.filter(m => m.status === 'deploying').length,
    unknown: machines.filter(m => m.status === 'unknown').length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader
        title="Machine Registry"
        subtitle={`${machines.length} registered endpoints`}
        action={<Button onClick={() => setShowCreate(true)}>+ Register Machine</Button>}
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Online', count: stats.online, color: 'text-terminal-green' },
          { label: 'Deploying', count: stats.deploying, color: 'text-terminal-accent' },
          { label: 'Offline', count: stats.offline, color: 'text-terminal-red' },
          { label: 'Unknown', count: stats.unknown, color: 'text-terminal-muted' },
        ].map(s => (
          <div key={s.label} className="terminal-card p-3 text-center">
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.count}</div>
            <div className="text-terminal-muted text-xs font-mono uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="terminal-card w-full max-w-md p-6">
            <div className="text-xs font-mono text-terminal-accent mb-5">// REGISTER MACHINE</div>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Machine Name *', placeholder: 'DESKTOP-001' },
                { key: 'ip_address', label: 'IP Address', placeholder: '192.168.1.100' },
                { key: 'os_version', label: 'OS Version', placeholder: 'Windows 11 Pro' },
                { key: 'department', label: 'Department', placeholder: 'Engineering' },
                { key: 'assigned_to', label: 'Assigned To', placeholder: 'John Smith' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-mono text-terminal-muted uppercase mb-1">{field.label}</label>
                  <input
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(f => ({...f, [field.key]: e.target.value}))}
                    placeholder={field.placeholder}
                    className="w-full bg-black/40 border border-terminal-border text-terminal-text rounded p-2 font-mono text-sm focus:outline-none focus:border-terminal-accent"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleCreate}>Register</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Machines Table */}
      {machines.length === 0 ? (
        <EmptyState message="No machines registered. Add one to start deploying." />
      ) : (
        <div className="terminal-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-terminal-border bg-black/20">
                {['Status', 'Machine', 'IP Address', 'OS Version', 'Department', 'Assigned To', 'Last Seen', 'Deployments', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-terminal-muted font-mono text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {machines.map(m => (
                <tr key={m.id} className="border-b border-terminal-border/30 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm ${
                        m.status === 'online' ? 'text-terminal-green' :
                        m.status === 'deploying' ? 'text-terminal-accent animate-pulse' :
                        m.status === 'offline' ? 'text-terminal-red' : 'text-terminal-muted'
                      }`}>{statusIcons[m.status]}</span>
                      <StatusBadge status={m.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-terminal-muted text-sm">{m.ip_address || '—'}</td>
                  <td className="px-4 py-3 text-terminal-text text-sm">{m.os_version || '—'}</td>
                  <td className="px-4 py-3 text-terminal-text text-sm">{m.department || '—'}</td>
                  <td className="px-4 py-3 text-terminal-text text-sm">{m.assigned_to || '—'}</td>
                  <td className="px-4 py-3 font-mono text-terminal-muted text-xs">
                    {m.last_seen ? formatDistanceToNow(new Date(m.last_seen), { addSuffix: true }) : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className="text-terminal-green">{m.successful_deployments || 0}</span>
                    <span className="text-terminal-muted">/{m.total_deployments || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(m.id)} className="text-terminal-muted hover:text-terminal-red text-xs font-mono transition-colors">
                      REMOVE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
