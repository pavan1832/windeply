'use client';
import { useEffect, useState } from 'react';
import { api, DashboardStats, Deployment, Log } from '../lib/api';
import { StatCard, StatusBadge, LogLevelBadge, Spinner } from '../components/ui';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const DEPLOYMENT_STEPS = ['Initialize', 'OS Config', 'Install Software', 'Security Policies', 'Finalize'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsData, deploymentsData] = await Promise.all([
        api.getDashboardStats(),
        api.getDeployments({ limit: '8' }),
      ]);
      setStats(statsData);
      setDeployments(deploymentsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Spinner />;

  const d = stats?.deployments;
  const machineMap = Object.fromEntries((stats?.machines || []).map(m => [m.status, parseInt(m.count)]));
  const pieData = [
    { name: 'Online', value: machineMap.online || 0, color: '#00ff88' },
    { name: 'Offline', value: machineMap.offline || 0, color: '#ff4444' },
    { name: 'Deploying', value: machineMap.deploying || 0, color: '#00d4ff' },
    { name: 'Unknown', value: machineMap.unknown || 0, color: '#4a6080' },
  ].filter(p => p.value > 0);

  const chartData = deployments.slice().reverse().map((dep, i) => ({
    name: `Job ${i + 1}`,
    success: dep.status === 'success' ? 1 : 0,
    failed: dep.status === 'failed' ? 1 : 0,
  }));

  const activeDeployments = deployments.filter(d => d.status === 'running' || d.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            System Dashboard
          </h1>
          <p className="text-terminal-muted text-sm font-mono mt-0.5">
            <span className="text-terminal-accent">■</span> LIVE · Windows Deployment Automation Platform
          </p>
        </div>
        <div className="text-right font-mono text-xs text-terminal-muted">
          <div className="text-terminal-green">● OPERATIONAL</div>
          <div>{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Jobs" value={d?.total || 0} color="accent" icon="⬡" />
        <StatCard label="Successful" value={d?.successful || 0} color="green" icon="✓" />
        <StatCard label="Failed" value={d?.failed || 0} color="red" icon="✗" />
        <StatCard label="Running" value={d?.active || 0} color="accent" icon="▶" sub="active now" />
        <StatCard label="Pending" value={d?.pending || 0} color="yellow" icon="⏳" sub="queued" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 terminal-card p-4">
          <div className="text-xs font-mono text-terminal-muted uppercase tracking-widest mb-4">Deployment History</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#4a6080', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid #1e2d4a', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
              <Area type="monotone" dataKey="success" stroke="#00ff88" fill="url(#cSuccess)" strokeWidth={2} />
              <Area type="monotone" dataKey="failed" stroke="#ff4444" fill="url(#cFailed)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="terminal-card p-4">
          <div className="text-xs font-mono text-terminal-muted uppercase tracking-widest mb-4">Machine Status</div>
          <div className="flex flex-col items-center">
            <PieChart width={140} height={140}>
              <Pie data={pieData} cx={65} cy={65} innerRadius={40} outerRadius={60} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div className="w-full space-y-1 mt-2">
              {pieData.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-terminal-muted">{p.name}</span>
                  </div>
                  <span className="text-white font-bold">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Deployments */}
      {activeDeployments.length > 0 && (
        <div className="terminal-card p-4 running-border">
          <div className="text-xs font-mono text-terminal-accent uppercase tracking-widest mb-3">
            ▶ Active Deployments ({activeDeployments.length})
          </div>
          <div className="space-y-3">
            {activeDeployments.map(dep => {
              const pct = dep.total_steps > 0 ? Math.round((dep.current_step / dep.total_steps) * 100) : 0;
              return (
                <div key={dep.id} className="bg-black/30 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-sm text-white">{dep.machine_name}</div>
                    <StatusBadge status={dep.status} />
                  </div>
                  <div className="text-xs font-mono text-terminal-muted mb-2">
                    Step {dep.current_step}/{dep.total_steps}: {DEPLOYMENT_STEPS[dep.current_step - 1] || 'Initializing...'}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill animate-pulse" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-right text-xs font-mono text-terminal-accent mt-1">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Logs */}
      <div className="terminal-card p-4">
        <div className="text-xs font-mono text-terminal-muted uppercase tracking-widest mb-3">Recent Activity</div>
        <div className="log-terminal max-h-64">
          {(stats?.recent_logs || []).length === 0 ? (
            <div className="text-terminal-muted">No logs yet. Start a deployment to see activity.</div>
          ) : (
            (stats?.recent_logs || []).map((log: Log) => (
              <div key={log.id} className="flex gap-3 py-0.5">
                <span className="text-terminal-muted shrink-0">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
                <LogLevelBadge level={log.level} />
                <span className={`${log.level === 'error' ? 'text-terminal-red' : log.level === 'warn' ? 'text-terminal-yellow' : 'text-terminal-text'}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Jobs Table */}
      <div className="terminal-card p-4">
        <div className="text-xs font-mono text-terminal-muted uppercase tracking-widest mb-3">Recent Deployment Jobs</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-terminal-border">
                {['Machine', 'Template', 'Profile', 'Status', 'Started', 'Progress'].map(h => (
                  <th key={h} className="text-left pb-2 text-terminal-muted font-mono text-xs uppercase tracking-wider pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deployments.map(dep => (
                <tr key={dep.id} className="border-b border-terminal-border/30 hover:bg-white/2">
                  <td className="py-2 pr-4 font-mono text-white">{dep.machine_name}</td>
                  <td className="py-2 pr-4 text-terminal-text">{dep.template_name}</td>
                  <td className="py-2 pr-4 font-mono text-terminal-muted text-xs">{dep.configuration_profile}</td>
                  <td className="py-2 pr-4"><StatusBadge status={dep.status} /></td>
                  <td className="py-2 pr-4 font-mono text-terminal-muted text-xs">
                    {dep.started_at ? formatDistanceToNow(new Date(dep.started_at), { addSuffix: true }) : '—'}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-terminal-border rounded overflow-hidden">
                        <div
                          className="h-full bg-terminal-accent"
                          style={{ width: `${dep.total_steps > 0 ? (dep.current_step / dep.total_steps) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-terminal-muted">
                        {dep.current_step}/{dep.total_steps}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
